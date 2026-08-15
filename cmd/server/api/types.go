package main

import (
	"net/http"
	"sync"
	"time"

	dbstore "github.com/Verifieddanny/bunguard/internal/db_store"
	"github.com/go-webauthn/webauthn/webauthn"
	"go.uber.org/zap"
)

type application struct {
	config                   config
	logger                   *zap.SugaredLogger
	showdownTimeout          time.Duration
	httpClient               *http.Client
	sessions                 *SessionStore
	store                    dbstore.Storage
	webauthn                 *webauthn.WebAuthn
	passkeySessionStore      *PasskeySessionStore
	passkeyLoginSessionStore *PasskeyLoginSessionStore
}

type config struct {
	addr            string
	apiURL          string
	db              dbConfig
	env             string
	oAuth           oAuth
	frontendURL     string
	frontendOrigins []string
}

type dbConfig struct {
	addr         string
	maxOpenConns int
	maxIdleConns int
	maxIdleTime  string
}

type oAuth struct {
	Github GithubConfig
	Google GoogleConfig
}

type GoogleConfig struct {
	ClientID     string
	ClientSecret string
}

type GithubConfig struct {
	ClientID     string
	ClientSecret string
}

type GithubUser struct {
	Username  string `json:"login"`
	Email     string `json:"email"`
	ID        int    `json:"id"`
	AvatarURL string `json:"avatar_url"`
}

type SessionStore struct {
	mu       sync.RWMutex
	sessions map[string]int64
}

type PasskeySessionStore struct {
	mu       sync.RWMutex
	sessions map[int64]*webauthn.SessionData // keyed by userID for registration
}

type PasskeyLoginSessionStore struct {
	mu       sync.RWMutex
	sessions map[string]*webauthn.SessionData // keyed by challenge for login
}

func NewPasskeySessionStore() *PasskeySessionStore {
	return &PasskeySessionStore{sessions: make(map[int64]*webauthn.SessionData)}
}

func (s *PasskeySessionStore) Set(key int64, data *webauthn.SessionData) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[key] = data
}

func (s *PasskeySessionStore) Get(key int64) (*webauthn.SessionData, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	d, ok := s.sessions[key]
	return d, ok
}

func (s *PasskeySessionStore) Delete(key int64) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, key)
}

func NewPasskeyLoginSessionStore() *PasskeyLoginSessionStore {
	return &PasskeyLoginSessionStore{sessions: make(map[string]*webauthn.SessionData)}
}

func (s *PasskeyLoginSessionStore) Set(key string, data *webauthn.SessionData) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[key] = data
}

func (s *PasskeyLoginSessionStore) Get(key string) (*webauthn.SessionData, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	d, ok := s.sessions[key]
	return d, ok
}

func (s *PasskeyLoginSessionStore) Delete(key string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, key)
}
