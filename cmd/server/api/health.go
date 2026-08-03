package main

import "net/http"

func (app *application) welcomeMessage(w http.ResponseWriter, r *http.Request) {
	data := map[string]string{
		"message": "Welcome to BunGuard API",
	}
	if err := app.jsonResponse(w, http.StatusOK, data); err != nil {
		app.internalServerError(w, r, err)
	}
}

func (app *application) healthcheck(w http.ResponseWriter, r *http.Request) {
	data := map[string]string{
		"status": "ok",
		"env":    app.config.env,
	}
	if err := app.jsonResponse(w, http.StatusOK, data); err != nil {
		app.internalServerError(w, r, err)
	}

}
