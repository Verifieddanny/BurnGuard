package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	dbstore "github.com/Verifieddanny/bunguard/internal/db_store"
)

func (app *application) syncUsageHandler(w http.ResponseWriter, r *http.Request) {
	// Extract token from Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		writeJsonError(w, http.StatusUnauthorized, "Missing or invalid Authorization header")
		return
	}
	rawToken := strings.TrimPrefix(authHeader, "Bearer ")

	// Validate token
	tokenHash := dbstore.HashToken(rawToken)
	userID, tokenID, err := app.store.SyncToken.ValidateAndGetUser(r.Context(), tokenHash)
	if err != nil {
		app.logger.Warnw("invalid sync token", "error", err.Error())
		writeJsonError(w, http.StatusUnauthorized, "Invalid sync token")
		return
	}

	// Parse request body
	var input struct {
		Records []dbstore.UsageRecord `json:"records"`
	}
	if err := readJSON(w, r, &input); err != nil {
		writeJsonError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if len(input.Records) == 0 {
		writeJsonError(w, http.StatusBadRequest, "No records provided")
		return
	}

	// Bulk insert
	count, err := app.store.UsageRecord.BulkCreate(r.Context(), userID, tokenID, input.Records)
	if err != nil {
		app.logger.Errorw("failed to store usage records", "error", err.Error(), "user_id", userID)
		app.internalServerError(w, r, err)
		return
	}

	app.logger.Infow("usage synced", "user_id", userID, "records", count)

	alertCfg, err := app.store.AlertConfig.GetByUser(r.Context(), userID)
	if err == nil && alertCfg != nil {
		// Get current total spend
		summary, err := app.store.UsageRecord.GetSummary(r.Context(), userID)
		if err == nil {
			budget, err := app.store.Budget.GetByUserID(userID)
			if err != nil {
				app.logger.Errorw("failed to get user budget", "error", err.Error(), "user_id", userID)
				app.internalServerError(w, r, err)
				return
			}

			// Get user's budget
			// (you'll need to fetch this from the budgets table)
			 // placeholder until you wire up budget from DB

			 monthlyLimit := budget.MonthlyLimit

			ratio := summary.TotalSpend / monthlyLimit
			if ratio >= 0.5 && alertCfg.Threshold50 {
				if alertCfg.SlackWebhook != "" {
					go sendWebhook(alertCfg.SlackWebhook, "slack", summary.TotalSpend, monthlyLimit, 50)
				}
				if alertCfg.DiscordWebhook != "" {
					go sendWebhook(alertCfg.DiscordWebhook, "discord", summary.TotalSpend, monthlyLimit, 50)
				}
			}

			if ratio >= 0.8 && alertCfg.Threshold80 {
				if alertCfg.SlackWebhook != "" {
					go sendWebhook(alertCfg.SlackWebhook, "slack", summary.TotalSpend, monthlyLimit, 80)
				}
				if alertCfg.DiscordWebhook != "" {
					go sendWebhook(alertCfg.DiscordWebhook, "discord", summary.TotalSpend, monthlyLimit, 80)
				}
			}

			if ratio >= 1.0 && alertCfg.Threshold100 {
				if alertCfg.SlackWebhook != "" {
					go sendWebhook(alertCfg.SlackWebhook, "slack", summary.TotalSpend, monthlyLimit, 100)
				}
				if alertCfg.DiscordWebhook != "" {
					go sendWebhook(alertCfg.DiscordWebhook, "discord", summary.TotalSpend, monthlyLimit, 100)
				}
			}
		}
	}

	if err := app.jsonResponse(w, http.StatusCreated, map[string]int{"synced": count}); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func sendWebhook(webhookURL, platform string, totalSpend, budget float64, threshold int) {
	message := map[string]any{
		"text": fmt.Sprintf("Alert: You've reached %d%% of your budget! Total spend: $%.2f, Budget: $%.2f", threshold, totalSpend, budget),
	}

	payload, _ := json.Marshal(message)
	req, _ := http.NewRequest("POST", webhookURL, bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Failed to send %s webhook: %v", platform, err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		log.Printf("Failed to send %s webhook, status: %s", platform, resp.Status)
	}
}