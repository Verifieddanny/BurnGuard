package sync

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/Verifieddanny/bunguard/internal/config"
	"github.com/Verifieddanny/bunguard/internal/storage"
)

type Syncer struct {
	store    storage.Storage
	client   *http.Client
	token    string
	url      string
	interval time.Duration
}

func NewSyncer(store storage.Storage, cfg config.SyncConfig) *Syncer {
	return &Syncer{
		store:    store,
		client:   &http.Client{Timeout: 10 * time.Second},
		token:    cfg.Token,
		url:      cfg.URL,
		interval: time.Duration(cfg.Interval) * time.Second,
	}
}

func (s *Syncer) Start(ctx context.Context) {
	log.Printf("Sync started — every %v to %s", s.interval, s.url)

	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("Sync stopped")
			return
		case <-ticker.C:
			s.syncOnce(ctx)
		}
	}
}

func (s *Syncer) syncOnce(ctx context.Context) {
	records, err := s.store.Usage.GetUnsynced(ctx, 100)
	if err != nil {
		log.Println("Sync: failed to fetch unsynced records:", err)
		return
	}

	if len(records) == 0 {
		return
	}

	body, err := json.Marshal(map[string]any{
		"records": records,
	})
	if err != nil {
		log.Println("Sync: failed to marshal records:", err)
		return
	}

	req, err := http.NewRequestWithContext(ctx, "POST", s.url+"/v1/usage", bytes.NewReader(body))
	if err != nil {
		log.Println("Sync: failed to create request:", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.token)

	resp, err := s.client.Do(req)
	if err != nil {
		log.Println("Sync: failed to send records:", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		log.Printf("Sync: backend returned status %d", resp.StatusCode)
		return
	}

	// Mark as synced
	ids := make([]int, len(records))
	for i, r := range records {
		ids[i] = r.ID
	}

	if err := s.store.Usage.MarkSynced(ctx, ids); err != nil {
		log.Println("Sync: failed to mark records as synced:", err)
		return
	}

	log.Printf("Sync: sent %d records to backend", len(records))
}