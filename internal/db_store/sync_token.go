package dbstore

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"fmt"
	"time"
)

type SyncToken struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id"`
	Name       string    `json:"name"`
	LastUsedAt *time.Time `json:"last_used_at"`
	CreatedAt  time.Time `json:"created_at"`
}

type SyncTokenStore struct {
	db *sql.DB
}


func GenerateToken() (raw string, hash string, err error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", "", err
	}
	raw = "bg_" + hex.EncodeToString(b)
	h := sha256.Sum256([]byte(raw))
	hash = hex.EncodeToString(h[:])
	return raw, hash, nil
}

func HashToken(raw string) string {
	h := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(h[:])
}


func (s *SyncTokenStore) Create(ctx context.Context, userID int64, name string) (string, error) {
	raw, hash, err := GenerateToken()
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	query := `INSERT INTO sync_tokens (user_id, token_hash, name) VALUES ($1, $2, $3)`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err = s.db.ExecContext(ctx, query, userID, hash, name)
	if err != nil {
		return "", fmt.Errorf("failed to create sync token: %w", err)
	}

	return raw, nil
}

func (s *SyncTokenStore) ListByUser(ctx context.Context, userID int64) ([]SyncToken, error) {
	query := `SELECT id, user_id, name, last_used_at, created_at FROM sync_tokens WHERE user_id = $1 ORDER BY created_at DESC`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list sync tokens: %w", err)
	}
	defer rows.Close()

	var tokens []SyncToken
	for rows.Next() {
		var t SyncToken
		if err := rows.Scan(&t.ID, &t.UserID, &t.Name, &t.LastUsedAt, &t.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan sync token: %w", err)
		}
		tokens = append(tokens, t)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating sync tokens: %w", err)
	}

	return tokens, nil
}


func (s *SyncTokenStore) ValidateAndGetUser(ctx context.Context, tokenHash string) (int64, int, error) {
	query := `SELECT id, user_id FROM sync_tokens WHERE token_hash = $1`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var tokenID int
	var userID int64
	err := s.db.QueryRowContext(ctx, query, tokenHash).Scan(&tokenID, &userID)
	if err != nil {
		return 0, 0, err
	}

	// Update last_used_at
	go func() {
		s.db.Exec(`UPDATE sync_tokens SET last_used_at = NOW() WHERE id = $1`, tokenID)
	}()

	return userID, tokenID, nil
}


func (s *SyncTokenStore) Delete(ctx context.Context, id int, userID int64) error {
	query := `DELETE FROM sync_tokens WHERE id = $1 AND user_id = $2`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	result, err := s.db.ExecContext(ctx, query, id, userID)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}