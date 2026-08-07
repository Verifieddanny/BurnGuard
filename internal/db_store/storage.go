package dbstore

import (
	"context"
	"database/sql"

	"github.com/go-webauthn/webauthn/webauthn"
)

var ErrNotFound = sql.ErrNoRows

type Storage struct {
	User interface {
		CreateOrLink(context.Context, *User) error
		GetByID(context.Context, int64) (*User, error)
	}
	SyncToken interface {
		Create(ctx context.Context, userID int64, name string) (string, error)
		ListByUser(ctx context.Context, userID int64) ([]SyncToken, error)
		ValidateAndGetUser(ctx context.Context, tokenHash string) (int64, int, error)
		Delete(ctx context.Context, id int, userID int64) error
	}
	UsageRecord interface {
		BulkCreate(ctx context.Context, userID int64, tokenID int, records []UsageRecord) (int, error)
		GetSummary(ctx context.Context, userID int64) (*DashboardSummary, error)
		GetDailySpend(ctx context.Context, userID int64, days int) ([]DailySpend, error)
		GetProviderBreakdown(ctx context.Context, userID int64) ([]ProviderBreakdown, error)
		GetRecent(ctx context.Context, userID int64, limit int) ([]UsageRecord, error)
	}
	AlertConfig interface {
		GetByUser(ctx context.Context, userID int64) (*AlertConfig, error)
		Upsert(ctx context.Context, userID int64, cfg *AlertConfig) error
	}
	Budget interface {
		GetByUserID(userID int64) (*Budget, error)
		Upsert(budget *Budget) error
	}
	Passkey interface {
		Create(ctx context.Context, userID int, cred *webauthn.Credential, name string) error
		GetByUser(ctx context.Context, userID int) ([]webauthn.Credential, error)
		UpdateSignCount(ctx context.Context, credentialID []byte, signCount uint32) error
		GetUserByCredentialID(ctx context.Context, credentialID []byte) (*User, error)

	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		User:        &UserStore{db},
		SyncToken:   &SyncTokenStore{db},
		UsageRecord: &UsageRecordStore{db},
		AlertConfig: &AlertConfigStore{db},
		Budget:      &BudgetStore{db},
		Passkey:     &PasskeyStore{db},
	}
}
