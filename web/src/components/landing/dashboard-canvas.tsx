"use client";

import { useMemo, useState } from "react";
import {
  budgetColor,
  budgetStatus,
  formatCurrency,
  formatTokenCount,
} from "@/lib/utils";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { DraggableCard } from "./draggable-card";
import { LiveCursors } from "./live-cursors";

const SPEND = 47.23;

const DAILY = Array.from({ length: 24 }, (_, i) => {
  const wave = Math.sin(i / 3) * 0.5 + Math.sin(i / 1.7) * 0.3;
  return 0.9 + wave + (i / 24) * 1.4 + (i % 5 === 0 ? 0.5 : 0);
});

// Provider bars use the single accent at stepped opacity — one brand color.
const PROVIDERS = [
  { name: "Anthropic", cost: 32.1, opacity: 1 },
  { name: "OpenAI", cost: 12.4, opacity: 0.55 },
  { name: "Google", cost: 2.73, opacity: 0.3 },
];

/**
 * The "dashboard" route of the in-window mini-app: draggable widgets on a
 * canvas with ambient collaborator cursors. Rendered inside a positioned stage
 * supplied by the interactive window shell.
 */
export function DashboardPage() {
  return (
    <>
      <SpendCard />
      <RequestsCard />
      <ChartCard />
      <BudgetCard />
      <ProvidersCard />
      <LiveCursors />
    </>
  );
}

function SpendCard() {
  return (
    <DraggableCard x={20} y={20} label="spend" className="w-44 pb-3">
      <div className="px-3 pt-1">
        <p className="font-mono text-3xl font-semibold tabular text-accent">
          {formatCurrency(SPEND)}
        </p>
        <p className="mt-1 text-xs text-fg-subtle">this month</p>
      </div>
    </DraggableCard>
  );
}

function RequestsCard() {
  return (
    <DraggableCard x={210} y={20} label="requests" className="w-40 pb-3">
      <div className="px-3 pt-1">
        <p className="font-mono text-2xl font-semibold tabular text-fg">1,847</p>
        <p className="mt-1 text-xs text-fg-subtle">
          {formatTokenCount(2_400_000)} in · {formatTokenCount(892_000)} out
        </p>
      </div>
    </DraggableCard>
  );
}

function ChartCard() {
  const { line, area } = useMemo(() => {
    const w = 270;
    const h = 90;
    const max = Math.max(...DAILY);
    const stepX = w / (DAILY.length - 1);
    const pts = DAILY.map((v, i) => [i * stepX, h - (v / max) * (h - 8) - 4]);
    const line = pts
      .map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(" ");
    return { line, area: `${line} L${w} ${h} L0 ${h} Z` };
  }, []);

  return (
    <DraggableCard x={20} y={150} label="daily spend" className="w-[300px] pb-3">
      <div className="px-3 pt-1">
        <svg viewBox="0 0 270 90" className="h-[90px] w-full">
          <path d={area} fill="var(--accent)" fillOpacity={0.12} />
          <path
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </DraggableCard>
  );
}

function BudgetCard() {
  const [budget, setBudget] = useState(75);
  const pct = budget > 0 ? Math.min((SPEND / budget) * 100, 100) : 100;
  const color = budgetColor(budgetStatus(SPEND, budget));
  const blocked = SPEND >= budget;

  return (
    <DraggableCard x={350} y={40} label="budget" className="w-64 pb-3">
      <div className="px-3 pt-1">
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1 font-mono text-sm text-fg">
            <span className="text-fg-subtle">$</span>
            <input
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-16 rounded-md border border-border bg-bg px-2 py-1 text-right tabular text-fg outline-none focus:border-accent"
            />
            <span className="text-fg-subtle">/mo</span>
          </label>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ color, backgroundColor: `${color}1f` }}
          >
            {blocked ? <CloseIcon size={11} /> : <CheckIcon size={11} />}
            {blocked ? "Blocked" : "Guarded"}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
        <p className="mt-1.5 font-mono text-[11px] text-fg-subtle">
          {formatCurrency(SPEND)} used · {pct.toFixed(0)}%
        </p>
      </div>
    </DraggableCard>
  );
}

function ProvidersCard() {
  return (
    <DraggableCard x={330} y={230} label="providers" className="w-[300px] pb-3">
      <div className="space-y-2 px-3 pt-1">
        {PROVIDERS.map((p) => (
          <div key={p.name} className="flex items-center gap-3 text-xs">
            <span className="w-16 shrink-0 text-fg-muted">{p.name}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-accent"
                style={{ width: `${(p.cost / SPEND) * 100}%`, opacity: p.opacity }}
              />
            </div>
            <span className="w-12 shrink-0 text-right font-mono tabular text-fg">
              {formatCurrency(p.cost)}
            </span>
          </div>
        ))}
      </div>
    </DraggableCard>
  );
}
