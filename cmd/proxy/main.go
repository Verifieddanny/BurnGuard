package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Verifieddanny/bunguard/internal/alerts"
	"github.com/Verifieddanny/bunguard/internal/budget"
	"github.com/Verifieddanny/bunguard/internal/config"
	"github.com/Verifieddanny/bunguard/internal/db"
	"github.com/Verifieddanny/bunguard/internal/middleware"
	"github.com/Verifieddanny/bunguard/internal/proxy"
	"github.com/Verifieddanny/bunguard/internal/storage"
	bgsync "github.com/Verifieddanny/bunguard/internal/sync"
)

func main() {
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "init":
			if err := runInit(); err != nil {
				log.Fatal(err)
			}
			return
		case "start":
			// fall through to existing proxy startup code
		default:
			fmt.Printf("Unknown command: %s\n", os.Args[1])
			fmt.Println("Usage: burnguard [init|start]")
			os.Exit(1)
		}
	}

	configPath := "burnguard.yaml"
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Fatal("No burnguard.yaml found. Run 'burnguard init' first.")
	}

	cfg, err := config.Load(configPath)
	if err != nil {
		log.Fatal(err)
	}
	if cfg.Budget.Limit <= 0 {
		log.Fatal("Invalid burnguard.yaml: budget.limit must be greater than 0. Run 'burnguard init' again or edit the config.")
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

	bgsyncer := bgsync.NewSyncer(storage.NewStorage(conn), cfg.Sync)
	if cfg.Sync.Enabled {
		go bgsyncer.Start(context.Background())
	}

	log.Fatal(http.ListenAndServe(cfg.Server.ProxyPort, mux))
}
