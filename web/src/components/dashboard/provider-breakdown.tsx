"use client";

import { useProviderBreakdown } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";

export function ProviderBreakdown() {
  const { data } = useProviderBreakdown();
  const rows = data ?? [];
  const total = rows.reduce((s, r) => s + r.cost, 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 font-semibold text-fg">Providers</h2>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-fg-subtle">
          No provider data yet.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => {
            const pct = total > 0 ? (r.cost / total) * 100 : 0;
            return (
              <div key={r.provider} className="flex items-center gap-3 text-sm">
                <span className="w-20 shrink-0 capitalize text-fg-muted">
                  {r.provider}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${pct}%`, opacity: Math.max(1 - i * 0.28, 0.35) }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs text-fg-subtle">
                  {pct.toFixed(0)}%
                </span>
                <span className="w-16 shrink-0 text-right font-mono tabular text-fg">
                  {formatCurrency(r.cost)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
