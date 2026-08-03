package main

import (
	"net/http"
	"os"
	"sync"
	"time"

	_ "github.com/lib/pq"

	"github.com/Verifieddanny/bunguard/internal/db"
	"go.uber.org/zap"
)

func main() {
	cfg := config{
		addr:   os.Getenv("ADDR"),
		env:    "development",
		apiUrl: "localhost:3001",
		db: dbConfig{
			addr:         os.Getenv("DATABASE_URL"),
			maxOpenConns: 30,
			maxIdleConns: 30,
			maxIdleTime:  "15m",
		},
		oAuth: oAuth{
			Github: GithubConfig{
				ClientID:     os.Getenv("GITHUB_CLIENT_ID"),
				ClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
			},
		},
	}

	logger := zap.Must(zap.NewProduction()).Sugar()
	defer logger.Sync()

	conn, err := db.NewConn(cfg.db.addr, cfg.db.maxOpenConns, cfg.db.maxIdleConns, cfg.db.maxIdleTime)

	if err != nil {
		logger.Fatal(err)
	}

	defer conn.Close()
	logger.Info("Database connection pool established")

	app := &application{
		config:          cfg,
		logger:          logger,
		showdownTimeout: 5 * time.Second,
		httpClient:      &http.Client{Timeout: 10 * time.Second},
		sessions:        &SessionStore{mu: sync.RWMutex{}, sessions: make(map[string]int64)},
	}

	mux := app.mount()

	logger.Fatal(app.run(mux))
}
