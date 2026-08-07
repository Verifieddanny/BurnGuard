package dbstore

import (
	"context"
	"database/sql"
	"fmt"
	"time"
)

type UsageRecord struct {
	ID                  int       `json:"id"`
	UserID              int       `json:"user_id"`
	SyncTokenID         int       `json:"sync_token_id"`
	Timestamp           time.Time `json:"timestamp"`
	Provider            string    `json:"provider"`
	Model               string    `json:"model"`
	InputTokens         int       `json:"input_tokens"`
	OutputTokens        int       `json:"output_tokens"`
	CacheCreationTokens int       `json:"cache_creation_tokens"`
	CacheReadTokens     int       `json:"cache_read_tokens"`
	Cost                float64   `json:"cost"`
	RequestPath         string    `json:"request_path"`
	SyncedAt            time.Time `json:"synced_at"`
}

type DashboardSummary struct {
	TotalSpend     float64 `json:"total_spend"`
	TotalRequests  int     `json:"total_requests"`
	TotalInput     int     `json:"total_input_tokens"`
	TotalOutput    int     `json:"total_output_tokens"`
}

type DailySpend struct {
	Date string  `json:"date"`
	Cost float64 `json:"cost"`
}

type ProviderBreakdown struct {
	Provider   string  `json:"provider"`
	Cost       float64 `json:"cost"`
	Requests   int     `json:"requests"`
}


type UsageRecordStore struct {
	db *sql.DB
}


func (s *UsageRecordStore) BulkCreate(ctx context.Context, userID int64, tokenID int, records []UsageRecord) (int, error) {
	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	query := `INSERT INTO usage_records 
		(user_id, sync_token_id, timestamp, provider, model, input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens, cost, request_path)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

	stmt, err := tx.PrepareContext(ctx, query)
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	count := 0
	for _, r := range records {
		_, err := stmt.ExecContext(ctx,
			userID, tokenID, r.Timestamp, r.Provider, r.Model,
			r.InputTokens, r.OutputTokens, r.CacheCreationTokens,
			r.CacheReadTokens, r.Cost, r.RequestPath,
		)
		if err != nil {
			return count, err
		}
		count++
	}

	return count, tx.Commit()
}

func (s *UsageRecordStore) GetSummary(ctx context.Context, userID int64) (*DashboardSummary, error) {
	query := `SELECT 
		COALESCE(SUM(cost), 0),
		COUNT(*),
		COALESCE(SUM(input_tokens), 0),
		COALESCE(SUM(output_tokens), 0)
		FROM usage_records WHERE user_id = $1`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var s2 DashboardSummary
	err := s.db.QueryRowContext(ctx, query, userID).Scan(
		&s2.TotalSpend, &s2.TotalRequests, &s2.TotalInput, &s2.TotalOutput,
	)
	return &s2, err
}


func (s *UsageRecordStore) GetDailySpend(ctx context.Context, userID int64, days int) ([]DailySpend, error) {
	query := `SELECT 
		DATE(timestamp) as date, 
		SUM(cost) as cost
		FROM usage_records 
		WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '1 day' * $2
		GROUP BY DATE(timestamp)
		ORDER BY date`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, userID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []DailySpend
	for rows.Next() {
		var d DailySpend
		if err := rows.Scan(&d.Date, &d.Cost); err != nil {
			return nil, err
		}
		result = append(result, d)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating daily spend records: %w", err)
	}
	return result, nil
}


func (s *UsageRecordStore) GetProviderBreakdown(ctx context.Context, userID int64) ([]ProviderBreakdown, error) {
	query := `SELECT 
		provider, 
		SUM(cost), 
		COUNT(*)
		FROM usage_records 
		WHERE user_id = $1
		GROUP BY provider 
		ORDER BY SUM(cost) 
		DESC`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []ProviderBreakdown
	for rows.Next() {
		var p ProviderBreakdown
		if err := rows.Scan(&p.Provider, &p.Cost, &p.Requests); err != nil {
			return nil, err
		}
		result = append(result, p)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating provider breakdown records: %w", err)
	}
	return result, nil
}


func (s *UsageRecordStore) GetRecent(ctx context.Context, userID int64, limit int) ([]UsageRecord, error) {
	query := `SELECT 
		id, user_id, sync_token_id, 
		timestamp, provider, model, 
		input_tokens, output_tokens, 
		cache_creation_tokens, 
		cache_read_tokens, cost, 
		request_path, synced_at
		FROM usage_records 
		WHERE user_id = $1
		ORDER BY timestamp 
		DESC LIMIT $2`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []UsageRecord
	for rows.Next() {
		var r UsageRecord
		if err := rows.Scan(
			&r.ID, &r.UserID, &r.SyncTokenID, &r.Timestamp, &r.Provider, &r.Model,
			&r.InputTokens, &r.OutputTokens, &r.CacheCreationTokens, &r.CacheReadTokens,
			&r.Cost, &r.RequestPath, &r.SyncedAt,
		); err != nil {
			return nil, err
		}
		result = append(result, r)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating recent usage records: %w", err)
	}
	return result, nil
}