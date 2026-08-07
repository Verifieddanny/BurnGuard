package storage

import (
	"strings"
	"context"
	"database/sql"
	"fmt"
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


func (s *UsageStore) GetUnsynced(ctx context.Context, limit int) ([]Usage, error) {
	query := `SELECT id, timestamp, provider, model, input_tokens, output_tokens, 
		cache_creation_tokens, cache_read_tokens, cost, request_path 
		FROM requests WHERE synced = 0 ORDER BY id ASC LIMIT ?`

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var records []Usage
	for rows.Next() {
		var r Usage
		if err := rows.Scan(&r.ID, &r.Timestamp, &r.Provider, &r.Model,
			&r.InputTokens, &r.OutputTokens, &r.CacheCreationTokens,
			&r.CacheReadTokens, &r.Cost, &r.RequestPath); err != nil {
			return nil, err
		}
		records = append(records, r)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating recent usage records: %w", err)
	}
	return records, nil
}

func (s *UsageStore) MarkSynced(ctx context.Context, ids []int) error {
	if len(ids) == 0 {
		return nil
	}

	var query strings.Builder; query.WriteString(`UPDATE requests SET synced = 1 WHERE id IN (`)
	args := make([]any, len(ids))
	for i, id := range ids {
		if i > 0 {
			query.WriteString(",")
		}
		query.WriteString("?")
		args[i] = id
	}
	query.WriteString(")")

	ctx, cancel := context.WithTimeout(ctx, QueryTimeoutDuration)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query.String(), args...)
	return err
}