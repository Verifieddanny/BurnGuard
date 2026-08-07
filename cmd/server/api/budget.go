package main

import (
	"database/sql"
	"errors"
	"net/http"

	dbstore "github.com/Verifieddanny/bunguard/internal/db_store"
)

func (app *application) setBudgetHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int64)

	var input struct {
		Amount float64 `json:"amount"`
	}

	if err := readJSON(w, r, &input); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	budget := &dbstore.Budget{
		UserID:       userID,
		MonthlyLimit: input.Amount,
	}

	if err := app.store.Budget.Upsert(budget); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	app.jsonResponse(w, 200, map[string]any{
		"message": "Budget set successfully",
	})
}

func (app *application) getBudgetHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int64)

	budget, err := app.store.Budget.GetByUserID(userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			app.jsonResponse(w, http.StatusOK, map[string]any{
				"amount": 0,
			})
			return
		}
		app.internalServerError(w, r, err)
		return
	}

	app.jsonResponse(w, http.StatusOK, map[string]any{
		"amount": budget.MonthlyLimit,
	})
}
func (app *application) updateBudgetHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int64)

	var input struct {
		Amount float64 `json:"amount"`
	}

	if err := readJSON(w, r, &input); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	budget := &dbstore.Budget{
		UserID:       userID,
		MonthlyLimit: input.Amount,
	}

	if err := app.store.Budget.Upsert(budget); err != nil {
		app.internalServerError(w, r, err)
		return
	}

	app.jsonResponse(w, 200, map[string]any{
		"message": "Budget updated successfully",
	})
}
