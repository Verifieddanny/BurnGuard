package dbstore

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
)

type PasskeyStore struct {
	db *sql.DB
}

func (s *PasskeyStore) Create(ctx context.Context, userID int, cred *webauthn.Credential, name string) error {
	query := `INSERT INTO passkey_credentials (
		user_id, credential_id, public_key, attestation_type, aaguid, sign_count, name,
		flags_user_present, flags_user_verified, flags_backup_eligibility, flags_backup_state
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query,
		userID,
		cred.ID,
		cred.PublicKey,
		cred.AttestationType,
		cred.Authenticator.AAGUID,
		cred.Authenticator.SignCount,
		name,
		cred.Flags.UserPresent,
		cred.Flags.UserVerified,
		cred.Flags.BackupEligible,
		cred.Flags.BackupState,
	)
	return err
}

func (s *PasskeyStore) GetByUser(ctx context.Context, userID int) ([]webauthn.Credential, error) {
	query := `SELECT credential_id, public_key, attestation_type, aaguid, sign_count,
		flags_user_present, flags_user_verified, flags_backup_eligibility, flags_backup_state
		FROM passkey_credentials WHERE user_id = $1`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	rows, err := s.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var creds []webauthn.Credential
	for rows.Next() {
		var c webauthn.Credential
		var aaguid []byte
		var signCount int

		if err := rows.Scan(
			&c.ID,
			&c.PublicKey,
			&c.AttestationType,
			&aaguid,
			&signCount,
			&c.Flags.UserPresent,
			&c.Flags.UserVerified,
			&c.Flags.BackupEligible,
			&c.Flags.BackupState,
		); err != nil {
			return nil, err
		}

		c.Authenticator.AAGUID = aaguid
		c.Authenticator.SignCount = uint32(signCount)
		creds = append(creds, c)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating passkey records: %w", err)
	}
	return creds, nil
}

func (s *PasskeyStore) UpdateSignCount(ctx context.Context, credentialID []byte, signCount uint32) error {
	query := `UPDATE passkey_credentials SET sign_count = $1 WHERE credential_id = $2`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	_, err := s.db.ExecContext(ctx, query, signCount, credentialID)
	return err
}

func (s *PasskeyStore) GetUserByCredentialID(ctx context.Context, credentialID []byte) (*User, error) {
	query := `SELECT u.id, u.github_id, u.google_id, u.name, u.email, u.avatar_url, u.created_at, u.updated_at
		FROM users u
		JOIN passkey_credentials p ON p.user_id = u.id
		WHERE p.credential_id = $1`

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	user := &User{}
	var ghID sql.NullInt64
	var gID sql.NullString

	err := s.db.QueryRowContext(ctx, query, credentialID).Scan(
		&user.ID, &ghID, &gID, &user.Name, &user.Email,
		&user.AvatarURL, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	if ghID.Valid {
		user.GithubID = ghID.Int64
	}
	if gID.Valid {
		user.GoogleID = gID.String
	}

	return user, nil
}
