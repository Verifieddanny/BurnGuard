package dbstore

import "database/sql"

type Budget struct {
	ID	 int64   `json:"id"`
	UserID int64   `json:"user_id"`
	MonthlyLimit float64 `json:"monthly_limit"`
	CreatedAt string  `json:"created_at"`
	UpdatedAt string  `json:"updated_at"`
}

type BudgetStore struct {
	db *sql.DB
}

func (s *BudgetStore) GetByUserID(userID int64) (*Budget, error) {
	query := `
	SELECT id, user_id, monthly_limit, created_at, updated_at
	FROM budgets
	WHERE user_id = $1`

	var budget Budget
	err := s.db.QueryRow(query, userID).Scan(
		&budget.ID,
		&budget.UserID,
		&budget.MonthlyLimit,
		&budget.CreatedAt,
		&budget.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	return &budget, nil
}

func (s *BudgetStore) Upsert(budget *Budget) error {
	query := `
	INSERT INTO budgets (user_id, monthly_limit)
	VALUES ($1, $2)
	ON CONFLICT (user_id)
	DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit, updated_at = NOW()
	RETURNING id, created_at, updated_at`

	err := s.db.QueryRow(
		query,
		budget.UserID,
		budget.MonthlyLimit,
	).Scan(
		&budget.ID,
		&budget.CreatedAt,
		&budget.UpdatedAt,
	)

	if err != nil {
		return err
	}

	return nil
}	
