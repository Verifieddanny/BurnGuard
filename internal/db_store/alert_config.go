package dbstore

import (
	"context"
	"database/sql"
	"time"
)

type AlertConfig struct {
	ID             int       `json:"id"`
	UserID         int       `json:"user_id"`
	SlackWebhook   string    `json:"slack_webhook"`
	DiscordWebhook string    `json:"discord_webhook"`
	Threshold50    bool      `json:"threshold_50"`
	Threshold80    bool      `json:"threshold_80"`
	Threshold100   bool      `json:"threshold_100"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type AlertConfigStore struct {
	db *sql.DB
}

func (s *AlertConfigStore) GetByUser(ctx context.Context, userID int64) (*AlertConfig, error) {
	query := `SELECT id, user_id, slack_webhook, discord_webhook, 
		threshold_50, threshold_80, threshold_100, created_at, updated_at
		FROM alert_configs WHERE user_id = $1`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var cfg AlertConfig
	err := s.db.QueryRowContext(ctx, query, userID).Scan(
		&cfg.ID, &cfg.UserID, &cfg.SlackWebhook, &cfg.DiscordWebhook,
		&cfg.Threshold50, &cfg.Threshold80, &cfg.Threshold100,
		&cfg.CreatedAt, &cfg.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // no config yet, return nil not error
		}
		return nil, err
	}
	return &cfg, nil
}

func (s *AlertConfigStore) Upsert(ctx context.Context, userID int64, cfg *AlertConfig) error {
	query := `INSERT INTO alert_configs (user_id, slack_webhook, discord_webhook, threshold_50, threshold_80, threshold_100)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (user_id)
		DO UPDATE SET slack_webhook = $2, discord_webhook = $3, 
			threshold_50 = $4, threshold_80 = $5, threshold_100 = $6, 
			updated_at = NOW()
		RETURNING id, created_at, updated_at`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return s.db.QueryRowContext(ctx, query,
		userID, cfg.SlackWebhook, cfg.DiscordWebhook,
		cfg.Threshold50, cfg.Threshold80, cfg.Threshold100,
	).Scan(&cfg.ID, &cfg.CreatedAt, &cfg.UpdatedAt)
}
