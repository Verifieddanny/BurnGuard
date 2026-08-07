"use client";

import Link from "next/link";
import { useSummary } from "@/hooks/use-dashboard";
import { useBudget } from "@/hooks/use-budget";
import {
  budgetColor,
  budgetStatus,
  formatCurrency,
  formatTokenCount,
} from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import { SpendChart } from "@/components/dashboard/spend-chart";
import { ProviderBreakdown } from "@/components/dashboard/provider-breakdown";
import { ModelBreakdown } from "@/components/dashboard/model-breakdown";
import { RequestsTable } from "@/components/dashboard/requests-table";
import { LightningIcon, ArrowRightIcon } from "@/components/icons";

export default function DashboardPage() {
  const { data: summary } = useSummary();
  const { data: budgetData } = useBudget();
  const budget = budgetData?.amount ?? 0;

  const spend = summary?.total_spend ?? 0;
  const requests = summary?.total_requests ?? 0;
  const pct = budget > 0 ? (spend / budget) * 100 : 0;
  const color = budgetColor(budgetStatus(spend, budget));
  const hasData = requests > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
          Overview
        </h1>
        <p className="text-sm text-fg-muted">Your AI spend at a glance.</p>
      </div>

      {!hasData && (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-5 sm:flex-row sm:items-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <LightningIcon size={20} />
          </span>
          <div className="flex-1">
            <p className="font-medium text-fg">No data yet</p>
            <p className="text-sm text-fg-muted">
              Connect your proxy to start tracking spend in real time.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Set up proxy <ArrowRightIcon size={15} />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total spend"
          value={formatCurrency(spend)}
          sub={`of ${formatCurrency(budget)} budget`}
          progress={{ pct, color }}
          accent
        />
        <StatCard label="Requests" value={requests.toLocaleString("en-US")} />
        <StatCard
          label="Input tokens"
          value={formatTokenCount(summary?.total_input_tokens ?? 0)}
        />
        <StatCard
          label="Output tokens"
          value={formatTokenCount(summary?.total_output_tokens ?? 0)}
        />
      </div>

      <SpendChart budget={budget} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ProviderBreakdown />
        <ModelBreakdown />
      </div>

      <RequestsTable />
    </div>
  );
}
