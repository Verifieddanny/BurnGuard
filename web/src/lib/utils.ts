import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts (last wins). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a dollar amount. Defaults to 2 decimals (stat cards); pass 4 for the
 * requests table where sub-cent costs matter (`$0.0003`).
 */
export function formatCurrency(value: number, decimals = 2): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Abbreviate token counts over 10K: `12.4K`, `2.1M`. Below 10K, group with
 * commas (`8,420`).
 */
export function formatTokenCount(value: number): string {
  if (value >= 1_000_000) {
    return `${trim(value / 1_000_000)}M`;
  }
  if (value >= 10_000) {
    return `${trim(value / 1_000)}K`;
  }
  return value.toLocaleString("en-US");
}

/** Drop a trailing `.0` (e.g. `2.0` -> `2`, `2.4` -> `2.4`). */
function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

/**
 * Human relative time: "just now", "2 minutes ago", "3 hours ago",
 * "Yesterday", "4 days ago", then falls back to a short date.
 */
export function formatRelativeTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 45) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Full timestamp for hover tooltips. */
export function formatFullTimestamp(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export type BudgetStatus = "ok" | "warning" | "danger";

/** Budget health from spend vs. limit: <50% ok, 50-80% warning, >80% danger. */
export function budgetStatus(spend: number, budget: number): BudgetStatus {
  if (budget <= 0) return "ok";
  const pct = (spend / budget) * 100;
  if (pct >= 80) return "danger";
  if (pct >= 50) return "warning";
  return "ok";
}

/** CSS color variable for a budget status, for progress bars and text. */
export function budgetColor(status: BudgetStatus): string {
  switch (status) {
    case "danger":
      return "var(--danger)";
    case "warning":
      return "var(--warning)";
    default:
      return "var(--success)";
  }
}
