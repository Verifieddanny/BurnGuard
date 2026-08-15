package main

import (
	"net/http"
	"net/url"
	"os"
	"strings"
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

	apiURL := os.Getenv("API_PUBLIC_URL")
	if apiURL == "" {
		apiURL = "http://localhost:" + port
	}
	apiURL = normalizeOrigin(apiURL)

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		env = os.Getenv("ENV")
	}
	if env == "" {
		env = "development"
	}

	frontendOrigins := parseOrigins(os.Getenv("FRONTEND_ORIGINS"), frontendURL)

	cfg := config{
		addr:   serverAddr,
		apiURL: apiURL,
		env:    env,
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
		frontendURL:     frontendURL,
		frontendOrigins: frontendOrigins,
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
		rpID = rpIDFromOrigin(frontendURL)
	}
	rpOrigins := parseOrigins(os.Getenv("WEBAUTHN_RP_ORIGINS"), frontendOrigins...)

	wn, err := webauthn.New(&webauthn.Config{
		RPDisplayName: "BurnGuard",
		RPID:          rpID,
		RPOrigins:     rpOrigins,
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

func parseOrigins(envValue string, defaults ...string) []string {
	values := defaults
	if envValue != "" {
		values = strings.Split(envValue, ",")
	}

	seen := make(map[string]bool)
	origins := make([]string, 0, len(values)+2)
	for _, value := range values {
		origin := normalizeOrigin(value)
		if origin == "" || seen[origin] {
			continue
		}
		seen[origin] = true
		origins = append(origins, origin)

		if alternate := alternateWWWOrigin(origin); alternate != "" && !seen[alternate] {
			seen[alternate] = true
			origins = append(origins, alternate)
		}
	}

	return origins
}

func normalizeOrigin(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return ""
	}

	u, err := url.Parse(value)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return strings.TrimRight(value, "/")
	}

	return u.Scheme + "://" + u.Host
}

func alternateWWWOrigin(origin string) string {
	u, err := url.Parse(origin)
	if err != nil || u.Scheme == "" || u.Host == "" {
		return ""
	}

	host := u.Hostname()
	port := u.Port()
	if host == "localhost" || strings.HasPrefix(host, "127.") || strings.Contains(host, ":") {
		return ""
	}

	if strings.HasPrefix(host, "www.") {
		host = strings.TrimPrefix(host, "www.")
	} else if strings.Count(host, ".") >= 1 {
		host = "www." + host
	} else {
		return ""
	}

	if port != "" {
		host += ":" + port
	}

	return u.Scheme + "://" + host
}

func rpIDFromOrigin(origin string) string {
	u, err := url.Parse(origin)
	if err != nil || u.Host == "" {
		return "localhost"
	}

	host := u.Hostname()
	if strings.HasPrefix(host, "www.") {
		return strings.TrimPrefix(host, "www.")
	}

	return host
}
