package storage

import (
	"context"
	"database/sql"
	"time"
)

type Usage struct {
	ID                  int       `json:"id"`
	Timestamp           time.Time `json:"timestamp"`
	Provider            string    `json:"provider"`
	Model               string    `json:"model"`
	InputTokens         int       `json:"input_tokens"`
	OutputTokens        int       `json:"output_tokens"`
	CacheCreationTokens int       `json:"cache_creation_tokens"`
	CacheReadTokens     int       `json:"cache_read_tokens"`
	Cost                float64   `json:"cost"`
	RequestPath         string    `json:"request_path"`
}

type UsageStore struct {
	db *sql.DB
}

func (s *UsageStore) Create(ctx context.Context, request *Usage) error {

	query := `
	INSERT INTO requests (timestamp, provider, model, input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens, cost, request_path) 
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	err := s.db.QueryRowContext(
		ctx,
		query,
		request.Timestamp,
		request.Provider,
		request.Model,
		request.InputTokens,
		request.OutputTokens,
		request.CacheCreationTokens,
		request.CacheReadTokens,
		request.Cost,
		request.RequestPath,
	).Scan(
		&request.ID,
	)

	if err != nil {

		return err

	}

	return nil
}
