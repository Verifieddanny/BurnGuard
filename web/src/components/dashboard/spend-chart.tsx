"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSpendChart, type ChartRange } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { DailySpend } from "@/lib/types";

const RANGES: ChartRange[] = [7, 30, 90];

function fmtDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: DailySpend }[];
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-xs text-fg-subtle">{fmtDate(p.date)}</p>
      <p className="font-mono text-sm font-semibold tabular text-fg">
        {formatCurrency(p.cost, 4)}
      </p>
    </div>
  );
}

export function SpendChart({ budget }: { budget: number }) {
  const [range, setRange] = useState<ChartRange>(30);
  const { data, isFetching } = useSpendChart(range);
  const perDay = budget > 0 ? budget / 30 : 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-fg">Daily spend</h2>
          <p className="text-xs text-fg-subtle">
            {isFetching ? "Updating…" : `Last ${range} days`}
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                range === r
                  ? "bg-accent text-accent-ink"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-fg-subtle">
          No spend in this range yet.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--border-strong)" }} />
              {perDay > 0 && (
                <ReferenceLine
                  y={perDay}
                  stroke="var(--accent)"
                  strokeDasharray="4 4"
                  strokeOpacity={0.5}
                />
              )}
              <Area
                type="monotone"
                dataKey="cost"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="var(--accent)"
                fillOpacity={0.14}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
