package main

import (
	"context"
	"errors"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func (app *application) mount() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{app.config.frontendURL},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.Timeout(60 * time.Second))

	r.Get("/health", app.healthcheck)
	r.Get("/welcome", app.welcomeMessage)

	r.Route("/v1", func(r chi.Router) {
		r.Route("/auth", func(r chi.Router) {
			r.Get("/github", app.redirectToGithub)
			r.Get("/github/callback", app.handleGithubCallback)

			r.Get("/google", app.redirectToGoogle)
			r.Get("/google/callback", app.handleGoogleCallback)

			r.Post("/passkey/login/begin", app.passkeyLoginBegin)
			r.Post("/passkey/login/finish", app.passkeyLoginFinish)

		})

		r.Post("/usage", app.syncUsageHandler)

		r.Group(func(r chi.Router) {
			r.Use(app.requireAuth)

			r.Get("/auth/me", app.getProfileHandler)
			r.Post("/auth/passkey/register/begin", app.passkeyRegisterBegin)
			r.Post("/auth/passkey/register/finish", app.passkeyRegisterFinish)

			r.Post("/tokens", app.createTokenHandler)
			r.Get("/tokens", app.listTokensHandler)

			r.Get("/dashboard/summary", app.dashboardSummaryHandler)
			r.Get("/dashboard/chart", app.dashboardChartHandler)
			r.Get("/dashboard/providers", app.dashboardProvidersHandler)
			r.Get("/dashboard/requests", app.dashboardRequestsHandler)

			r.Get("/alerts/config", app.getAlertConfigHandler)
			r.Put("/alerts/config", app.updateAlertConfigHandler)

			r.Get("/budget", app.getBudgetHandler)
			r.Put("/budget", app.updateBudgetHandler)
			r.Post("/budget", app.setBudgetHandler)

		})
	})

	return r
}

func (app *application) run(mux http.Handler) error {
	srv := &http.Server{
		Addr:         app.config.addr,
		Handler:      mux,
		WriteTimeout: time.Second * 30,
		ReadTimeout:  time.Second * 10,
		IdleTimeout:  time.Minute,
	}

	shutdown := make(chan error)

	go func() {
		quit := make(chan os.Signal, 1)

		signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
		s := <-quit

		ctx, cancel := context.WithTimeout(context.Background(), app.showdownTimeout)
		defer cancel()

		app.logger.Infow("signal caught", "signal", s.String())

		shutdown <- srv.Shutdown(ctx)
	}()

	app.logger.Infow("Starting server on", "addr", app.config.addr, "env", app.config.env)

	err := srv.ListenAndServe()
	if !errors.Is(err, http.ErrServerClosed) {
		return err
	}

	err = <-shutdown
	if err != nil {
		return err
	}

	app.logger.Infow("Server has stopped", "addr", app.config.addr, "env", app.config.env)

	return nil
}
