package storage

import (
	"context"
	"database/sql"
	"time"
)

var QueryTimeoutDuration = time.Second * 5

type Storage struct {
	Usage interface {
		Create(context.Context, *Usage) error
	}
}

func NewStorage(db *sql.DB) Storage {
	return Storage{
		Usage: &UsageStore{db},
	}
}
