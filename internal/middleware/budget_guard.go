package middleware

import (
	"net/http"

	"github.com/Verifieddanny/bunguard/internal/budget"
)


func BudgetGuard(next http.Handler, tracker *budget.Tracker) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {


		if tracker.IsOverBudget() {
			http.Error(w, "Blocked!", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}