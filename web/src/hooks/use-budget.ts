"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Monthly budget, from `GET /v1/budget` → `{ amount }`. */
export function useBudget() {
  return useQuery({
    queryKey: ["budget"],
    queryFn: api.budget.get,
  });
}

/** Update the monthly budget and refresh anything that depends on it. */
export function useUpdateBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => api.budget.update(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budget"] });
      // The dashboard's spend-vs-budget gauge reads the summary too.
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] });
    },
  });
}
