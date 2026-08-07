package main

import (
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
	_ "github.com/lib/pq"

	"github.com/Verifieddanny/bunguard/internal/db"
	dbstore "github.com/Verifieddanny/bunguard/internal/db_store"
	"go.uber.org/zap"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	serverAddr := ":" + port
	cfg := config{
		addr: serverAddr,
		env:  "development",
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

			Google: GoogleConfig{
				ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
				ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
			},
		},
		frontendURL: os.Getenv("FRONTEND_URL"),
	}

	logger := zap.Must(zap.NewProduction()).Sugar()
	defer logger.Sync()

	conn, err := db.NewConn(cfg.db.addr, cfg.db.maxOpenConns, cfg.db.maxIdleConns, cfg.db.maxIdleTime)

	if err != nil {
		logger.Fatal(err)
	}

	defer conn.Close()
	logger.Info("Database connection pool established")

	client := &http.Client{Timeout: 10 * time.Second}
	sessions := &SessionStore{mu: sync.RWMutex{}, sessions: make(map[string]int64)}

	storage := dbstore.NewStorage(conn)

	rpID := os.Getenv("WEBAUTHN_RP_ID")
	if rpID == "" {
		rpID = "localhost"
	}

	wn, err := webauthn.New(&webauthn.Config{
		RPDisplayName: "BurnGuard",
		RPID:          rpID,
		RPOrigins:     []string{cfg.frontendURL},
	})
	if err != nil {
		logger.Fatal("failed to init webauthn:", err)
	}
	app := &application{
		config:                   cfg,
		logger:                   logger,
		showdownTimeout:          5 * time.Second,
		httpClient:               client,
		sessions:                 sessions,
		store:                    storage,
		webauthn:                 wn,
		passkeySessionStore:      NewPasskeySessionStore(),
		passkeyLoginSessionStore: NewPasskeyLoginSessionStore(),
	}

	mux := app.mount()

	logger.Fatal(app.run(mux))
}
