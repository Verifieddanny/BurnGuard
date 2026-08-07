package main

import (
	"context"
	"net/http"
	"strings"
)

func (app *application) requireAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var sessionID string

		auth := r.Header.Get("Authorization")
		if strings.HasPrefix(auth, "Bearer session_") {
			sessionID = strings.TrimPrefix(auth, "Bearer ")
		}

		if sessionID == "" {
			writeJsonError(w, http.StatusUnauthorized, "Authentication required")
			return
		}

		userID, exists := app.SessionGet(sessionID)
		if !exists {
			writeJsonError(w, http.StatusUnauthorized, "Invalid or expired session")
			return
		}

		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
