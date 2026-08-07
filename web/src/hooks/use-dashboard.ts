"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  DailySpend,
  ModelBreakdown,
  ProviderBreakdown,
  UsageRecord,
} from "@/lib/types";

export function useSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: api.dashboard.summary,
  });
}

export type ChartRange = 7 | 30 | 90;

export function useSpendChart(days: ChartRange = 30) {
  return useQuery({
    queryKey: ["dashboard", "chart", days],
    // Backend returns `null` for an empty range; normalize to [].
    queryFn: async (): Promise<DailySpend[]> =>
      (await api.dashboard.chart(days)) ?? [],
  });
}

export function useProviderBreakdown() {
  return useQuery({
    queryKey: ["dashboard", "providers"],
    queryFn: async (): Promise<ProviderBreakdown[]> =>
      (await api.dashboard.providers()) ?? [],
  });
}

export function useRecentRequests(limit = 20) {
  return useQuery({
    queryKey: ["dashboard", "requests", limit],
    queryFn: async (): Promise<UsageRecord[]> =>
      (await api.dashboard.requests(limit)) ?? [],
  });
}

/**
 * Model breakdown derived client-side from recent requests, since the backend
 * has no dedicated endpoint. Pulls a larger sample and aggregates by model.
 */
export function useModelBreakdown(sample = 200) {
  return useQuery({
    queryKey: ["dashboard", "models", sample],
    queryFn: async (): Promise<ModelBreakdown[]> => {
      const records = (await api.dashboard.requests(sample)) ?? [];
      const byModel = new Map<string, ModelBreakdown>();
      for (const r of records) {
        const existing = byModel.get(r.model);
        if (existing) {
          existing.cost += r.cost;
          existing.requests += 1;
        } else {
          byModel.set(r.model, {
            model: r.model,
            provider: r.provider,
            cost: r.cost,
            requests: 1,
          });
        }
      }
      return [...byModel.values()].sort((a, b) => b.cost - a.cost);
    },
  });
}
