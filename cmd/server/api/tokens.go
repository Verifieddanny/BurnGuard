package main

import "net/http"

func (app *application) createTokenHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int64)

	var input struct {
		Name string `json:"name" validate:"required"`
	}
	if err := readJSON(w, r, &input); err != nil {
		writeJsonError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	rawToken, err := app.store.SyncToken.Create(r.Context(), userID, input.Name)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	// Return the raw token ONCE — user must save it
	if err := app.jsonResponse(w, http.StatusCreated, map[string]string{
		"token":   rawToken,
		"message": "Save this token — it won't be shown again",
	}); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}

func (app *application) listTokensHandler(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(int64)

	tokens, err := app.store.SyncToken.ListByUser(r.Context(), userID)
	if err != nil {
		app.internalServerError(w, r, err)
		return
	}

	if err := app.jsonResponse(w, http.StatusOK, tokens); err != nil {
		app.internalServerError(w, r, err)
		return
	}
}