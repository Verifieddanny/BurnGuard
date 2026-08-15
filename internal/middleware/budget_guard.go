package middleware

import (
	"fmt"
	"net/http"

	"github.com/Verifieddanny/bunguard/internal/budget"
)

func BudgetGuard(next http.Handler, tracker *budget.Tracker) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if tracker.IsOverBudget() {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			fmt.Fprintf(
				w,
				`{"error":"budget_exceeded","message":"BurnGuard monthly budget exceeded","spent":%.6f,"limit":%.6f}`+"\n",
				tracker.Total(),
				tracker.Limit(),
			)
			return
		}

		next.ServeHTTP(w, r)
	})
}
