package alerts

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/Verifieddanny/bunguard/internal/config"
)

type Alerter struct {
	mu             sync.Mutex
	slackWebhook   string
	discordWebhook string
	thresholds     []float64
	triggered      map[float64]bool
}

func NewAlerter(cfg config.AlertConfig) *Alerter {
	return &Alerter{
		slackWebhook:   cfg.SlackWebhook,
		discordWebhook: cfg.DiscordWebhook,
		thresholds:     cfg.Thresholds,
		triggered:      make(map[float64]bool),
	}
}

func (a *Alerter) Check(spent, budget float64) {
	if budget <= 0 {
		return
	}

	a.mu.Lock()
	defer a.mu.Unlock()

	ratio := spent / budget

	for _, threshold := range a.thresholds {
		if ratio >= threshold && !a.triggered[threshold] {
			a.triggered[threshold] = true
			percent := int(threshold * 100)
			message := fmt.Sprintf("BurnGuard: Budget %d%% used ($%.4f of $%.4f)", percent, spent, budget)
			log.Printf("Alert triggered: %s", message)

			go a.send(message)
		}
	}
}

func (a *Alerter) send(message string) {
	if a.slackWebhook != "" {
		a.postJSON(a.slackWebhook, map[string]string{"text": message})
	}
	if a.discordWebhook != "" {
		a.postJSON(a.discordWebhook, map[string]string{"content": message})
	}
}

func (a *Alerter) postJSON(url string, payload map[string]string) {
	body, err := json.Marshal(payload)
	if err != nil {
		log.Println("Failed to marshal alert payload:", err)
		return
	}

	resp, err := http.Post(url, "application/json", bytes.NewReader(body))
	if err != nil {
		log.Println("Failed to send alert to", url, ":", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		log.Printf("Alert webhook returned status %d for %s", resp.StatusCode, url)
	}
}
