package main

import "net/http"

import dbstore "github.com/Verifieddanny/bunguard/internal/db_store"

func (app *application) getAlertConfigHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int64)

	cfg, err := app.store.AlertConfig.GetByUser(r.Context(), userID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if cfg == nil {
		app.jsonResponse(w, http.StatusOK, map[string]any{
			"slack_webhook":   "",
			"discord_webhook": "",
			"threshold_50":    true,
			"threshold_80":    true,
			"threshold_100":   true,
		})
		return
	}

	app.jsonResponse(w, http.StatusOK, cfg)
}

func (app *application) updateAlertConfigHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int64)

	var input dbstore.AlertConfig
	if err := readJSON(w, r, &input); err != nil {
		writeJsonError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if err := app.store.AlertConfig.Upsert(r.Context(), userID, &input); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	app.jsonResponse(w, http.StatusOK, input)
}