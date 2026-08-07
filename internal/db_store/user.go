package dbstore

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
)

type User struct {
	ID          int                   `json:"id"`
	GithubID    int64                 `json:"github_id,omitempty"`
	GoogleID    string                `json:"google_id,omitempty"`
	Name        string                `json:"name"`
	Email       string                `json:"email"`
	AvatarURL   string                `json:"avatar_url"`
	CreatedAt   time.Time             `json:"created_at"`
	UpdatedAt   time.Time             `json:"updated_at"`
	Credentials []webauthn.Credential `json:"-"`
}

type UserStore struct {
	db *sql.DB
}

func (s *UserStore) CreateOrLink(ctx context.Context, user *User) error {
	if user.GithubID == 0 && user.GoogleID == "" {
		return errors.New("either GithubID or GoogleID must be provided")
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	var query string

	if user.GithubID != 0 {
		query = `
		INSERT INTO users (github_id, name, email, avatar_url)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE SET
			github_id  = EXCLUDED.github_id,
			name       = EXCLUDED.name,
			avatar_url = EXCLUDED.avatar_url,
			updated_at = NOW()
		RETURNING id, github_id, google_id, created_at, updated_at`

		var (
			ghID sql.NullInt64
			gID  sql.NullString
		)

		err := s.db.QueryRowContext(ctx, query, user.GithubID, user.Name, user.Email, user.AvatarURL).Scan(
			&user.ID, &ghID, &gID, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return err
		}
		if ghID.Valid {
			user.GithubID = ghID.Int64
		}
		if gID.Valid {
			user.GoogleID = gID.String
		}
		return nil
	}

	if user.GoogleID != "" {
		query = `
		INSERT INTO users (google_id, name, email, avatar_url)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (email) DO UPDATE SET
			google_id  = EXCLUDED.google_id,
			name       = EXCLUDED.name,
			avatar_url = EXCLUDED.avatar_url,
			updated_at = NOW()
		RETURNING id, github_id, google_id, created_at, updated_at`

		var (
			ghID sql.NullInt64
			gID  sql.NullString
		)

		err := s.db.QueryRowContext(ctx, query, user.GoogleID, user.Name, user.Email, user.AvatarURL).Scan(
			&user.ID, &ghID, &gID, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return err
		}
		if ghID.Valid {
			user.GithubID = ghID.Int64
		}
		if gID.Valid {
			user.GoogleID = gID.String
		}
		return nil
	}

	return nil
}

func (s *UserStore) GetByID(ctx context.Context, id int64) (*User, error) {
	query := `
	SELECT 
		id, 
		COALESCE(github_id, 0), 
		COALESCE(google_id, ''), 
		name, 
		email, 
		avatar_url, 
		created_at, 
		updated_at
	FROM users
	WHERE id = $1`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	user := &User{}
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID,
		&user.GithubID,
		&user.GoogleID,
		&user.Name,
		&user.Email,
		&user.AvatarURL,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	return user, nil
}

func (u *User) WebAuthnID() []byte {
	return fmt.Appendf(nil, "%d", u.ID)
}
func (u *User) WebAuthnName() string {
	return u.Email
}
func (u *User) WebAuthnDisplayName() string {
	return u.Name
}
func (u *User) WebAuthnIcon() string {
	return u.AvatarURL
}
func (u *User) WebAuthnCredentials() []webauthn.Credential {
	// load from passkey_credentials table
	return u.Credentials
}
