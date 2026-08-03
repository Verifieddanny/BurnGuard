package main

import (
	"log"
	"net/http"

	"github.com/Verifieddanny/bunguard/internal/alerts"
	"github.com/Verifieddanny/bunguard/internal/budget"
	"github.com/Verifieddanny/bunguard/internal/config"
	"github.com/Verifieddanny/bunguard/internal/db"
	"github.com/Verifieddanny/bunguard/internal/middleware"
	"github.com/Verifieddanny/bunguard/internal/proxy"
)

func main() {
	cfg, err := config.Load("burnguard.yaml")
	if err != nil {
		log.Fatal(err)
	}
	conn, err := db.New(cfg.Server.DBPath)

	if err != nil {
		log.Fatal(err)
	}

	if err := db.Init(conn); err != nil {
		log.Fatal(err)
	}

	defer conn.Close()

	log.Println("Database connection pool established")

	var totalSpend float64
	row := conn.QueryRow("SELECT COALESCE(SUM(cost), 0) FROM requests")
	row.Scan(&totalSpend)
	log.Printf("Total spend so far: $%.6f", totalSpend)

	tracker := budget.NewTracker(totalSpend, cfg.Budget.Limit)

	alerter := alerts.NewAlerter(cfg.Alerts)

	p := proxy.NewProxy(conn, tracker, cfg.Providers, alerter, cfg.Budget.Limit)

	mux := http.NewServeMux()
	mux.Handle("/", middleware.BudgetGuard(p, tracker))

	log.Printf("Listening on %v", cfg.Server.ProxyPort)

	log.Fatal(http.ListenAndServe(cfg.Server.ProxyPort, mux))
}
