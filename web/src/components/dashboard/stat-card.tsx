import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  /** Supporting line under the value (e.g. "of $75.00 budget"). */
  sub?: string;
  /** Optional progress bar (0–100) with an explicit color. */
  progress?: { pct: number; color: string };
  accent?: boolean;
}

export function StatCard({ label, value, sub, progress, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="text-xs uppercase tracking-wide text-fg-subtle">{label}</p>
      <p
        className={cn(
          "mt-2 font-mono text-3xl font-semibold tabular",
          accent ? "text-accent" : "text-fg",
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-fg-subtle">{sub}</p>}
      {progress && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progress.pct, 100)}%`,
              backgroundColor: progress.color,
            }}
          />
        </div>
      )}
    </div>
  );
}
