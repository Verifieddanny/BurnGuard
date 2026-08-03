package budget

import "sync"

type Tracker struct {
	mutex       sync.Mutex
	totalSpend  float64
	budgetLimit float64
}

func NewTracker(totalSpend, budgetLimit float64) *Tracker {
	return &Tracker{
		totalSpend:  totalSpend,
		budgetLimit: budgetLimit,
	}
}

func (t *Tracker) Add(cost float64) {
	t.mutex.Lock()
	defer t.mutex.Unlock()

	t.totalSpend += cost
}

func (t *Tracker) IsOverBudget() bool {
	t.mutex.Lock()
	defer t.mutex.Unlock()

	return t.totalSpend >= t.budgetLimit
}

func (t *Tracker) Total() float64 {
	t.mutex.Lock()
	defer t.mutex.Unlock()

	return t.totalSpend
}