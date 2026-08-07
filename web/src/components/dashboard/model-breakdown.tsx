"use client";

import { useModelBreakdown } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";

export function ModelBreakdown() {
  const { data } = useModelBreakdown();
  const rows = (data ?? []).slice(0, 6);
  const max = rows.reduce((m, r) => Math.max(m, r.cost), 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="mb-4 font-semibold text-fg">Top models</h2>
      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-fg-subtle">
          No model data yet.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.model} className="flex items-center gap-3 text-sm">
              <span className="w-40 shrink-0 truncate font-mono text-xs text-fg-muted">
                {r.model}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${max > 0 ? (r.cost / max) * 100 : 0}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right font-mono tabular text-fg">
                {formatCurrency(r.cost)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
