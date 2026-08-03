package proxy

import (
	"bytes"
	"context"
	"database/sql"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"time"

	"github.com/Verifieddanny/bunguard/internal/ai_models/anthropic"
	"github.com/Verifieddanny/bunguard/internal/ai_models/openai"
	"github.com/Verifieddanny/bunguard/internal/alerts"
	"github.com/Verifieddanny/bunguard/internal/budget"
	"github.com/Verifieddanny/bunguard/internal/config"
	"github.com/Verifieddanny/bunguard/internal/storage"
)

type contextKey string

const providerKey contextKey = "provider"

type ProxyServer struct {
	Proxy       *httputil.ReverseProxy
	store       storage.Storage
	tracker     *budget.Tracker
	providers   map[string]*url.URL
	alerter     *alerts.Alerter
	budgetLimit float64
}

func NewProxy(db *sql.DB, tracker *budget.Tracker, providersCfg map[string]config.ProviderConfig, alerter *alerts.Alerter, budgetLimit float64) *ProxyServer {
	providers := make(map[string]*url.URL)
	for name, cfg := range providersCfg {
		u, err := url.Parse(cfg.BaseURL)
		if err != nil {
			log.Printf("Invalid URL for provider %s: %v", name, err)
			continue
		}
		providers[name] = u
	}

	ps := &ProxyServer{
		store:       storage.NewStorage(db),
		tracker:     tracker,
		providers:   providers,
		alerter:     alerter,
		budgetLimit: budgetLimit,
	}

	ps.Proxy = &httputil.ReverseProxy{

		Rewrite: func(pr *httputil.ProxyRequest) {

			parts := strings.SplitN(pr.In.URL.Path, "/", 3)

			if len(parts) < 3 {
				log.Println("Invalid path:", pr.In.URL.Path)
				return
			}

			providerName := parts[1]
			remainingPath := "/" + parts[2]

			target, exists := ps.providers[providerName]
			if !exists {
				log.Println("Unknown provider:", providerName)
				return
			}

			ctx := context.WithValue(pr.In.Context(), providerKey, providerName)
			pr.Out = pr.Out.WithContext(ctx)

			pr.Out.URL.Scheme = target.Scheme
			pr.Out.URL.Host = target.Host
			pr.Out.URL.Path = remainingPath
			pr.Out.Host = target.Host
		},

		ModifyResponse: func(resp *http.Response) error {

			providerName, _ := resp.Request.Context().Value(providerKey).(string)

			contentType := resp.Header.Get("Content-Type")

			if strings.HasPrefix(contentType, "text/event-stream") {
				var parser SSEParser

				switch providerName {
				case "anthropic":
					parser = anthropic.ParseSSE
				case "openai":
					parser = openai.ParseSSE
				default:
					log.Println("Unknown provider for SSE:", providerName)
					return nil
				}

				resp.Body = NewStreamReader(
					resp.Body,
					ps.store,
					ps.tracker,
					parser,
					resp.Request.URL.Path,
					ps.alerter,
					ps.budgetLimit,
				)
				return nil
			}

			body, err := io.ReadAll(resp.Body)
			if err != nil {
				return err
			}

			resp.Body = io.NopCloser(bytes.NewReader(body))

			switch providerName {
			case "anthropic":
				usage, inputCost, outputCost, model, err := anthropic.ExtractUsage(body)
				if usage.InputTokens == 0 && usage.OutputTokens == 0 {
					log.Println("Skipping Anthropic usage — no tokens (likely error response)")
					return nil
				}

				if err != nil {
					log.Println("Skipping usage extraction:", err)
					return nil
				}

				usageInput := &storage.Usage{
					Timestamp:           time.Now(),
					Provider:            "anthropic",
					Model:               model,
					InputTokens:         usage.InputTokens,
					OutputTokens:        usage.OutputTokens,
					CacheCreationTokens: usage.CacheCreationInputTokens,
					CacheReadTokens:     usage.CacheReadInputTokens,
					Cost:                inputCost + outputCost,
					RequestPath:         resp.Request.URL.Path,
				}

				if err := ps.store.Usage.Create(resp.Request.Context(), usageInput); err != nil {
					log.Println("Failed to store usage:", err)
				} else {
					ps.tracker.Add(inputCost + outputCost)
					ps.alerter.Check(ps.tracker.Total(), ps.budgetLimit)
				}

				log.Printf("[%s] Input: %d Output: %d Cost: $%.6f",
					providerName, usage.InputTokens, usage.OutputTokens, inputCost+outputCost)

			case "openai":
				usage, inputCost, outputCost, model, err := openai.ExtractUsage(body)
				if usage.PromptTokens == 0 && usage.CompletionTokens == 0 {
					log.Println("Skipping OpenAI usage — no tokens (likely error response)")
					return nil
				}

				if err != nil {
					log.Println("Skipping OpenAI usage extraction:", err)
					return nil
				}

				usageInput := &storage.Usage{
					Timestamp:    time.Now(),
					Provider:     "openai",
					Model:        model,
					InputTokens:  usage.PromptTokens,
					OutputTokens: usage.CompletionTokens,
					Cost:         inputCost + outputCost,
					RequestPath:  resp.Request.URL.Path,
				}

				if err := ps.store.Usage.Create(resp.Request.Context(), usageInput); err != nil {
					log.Println("Failed to store usage:", err)
				} else {
					ps.tracker.Add(inputCost + outputCost)
					ps.alerter.Check(ps.tracker.Total(), ps.budgetLimit)
				}

				log.Printf("[%s] Input: %d Output: %d Cost: $%.6f",
					providerName, usage.PromptTokens, usage.CompletionTokens, inputCost+outputCost)

			default:
				log.Println("Unknown provider:", providerName)
			}

			return nil
		},

		FlushInterval: -1,
	}

	return ps
}

func (ps *ProxyServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	ps.Proxy.ServeHTTP(w, r)
}
