"use client";

import { useState } from "react";
import { useRecentRequests } from "@/hooks/use-dashboard";
import {
  formatCurrency,
  formatFullTimestamp,
  formatRelativeTime,
  formatTokenCount,
} from "@/lib/utils";

const PAGE_SIZE = 20;

export function RequestsTable() {
  const { data } = useRecentRequests(100);
  const rows = data ?? [];
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const slice = rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-border bg-surface">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="font-semibold text-fg">Recent requests</h2>
        {rows.length > PAGE_SIZE && (
          <div className="flex items-center gap-2 text-xs text-fg-subtle">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-border px-2 py-1 disabled:opacity-40 enabled:hover:bg-elevated"
            >
              Prev
            </button>
            <span className="tabular">
              {page + 1} / {pages}
            </span>
            <button
              type="button"
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-border px-2 py-1 disabled:opacity-40 enabled:hover:bg-elevated"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="px-5 pb-10 pt-6 text-center text-sm text-fg-subtle">
          No requests yet. Connect your proxy to start tracking.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-fg-subtle">
                <th className="px-5 py-2.5 font-medium">Time</th>
                <th className="px-5 py-2.5 font-medium">Provider</th>
                <th className="px-5 py-2.5 font-medium">Model</th>
                <th className="px-5 py-2.5 text-right font-medium">Input</th>
                <th className="px-5 py-2.5 text-right font-medium">Output</th>
                <th className="px-5 py-2.5 text-right font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {slice.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border/60 last:border-0 hover:bg-elevated/40"
                >
                  <td
                    className="whitespace-nowrap px-5 py-3 text-fg-muted"
                    title={formatFullTimestamp(r.timestamp)}
                  >
                    {formatRelativeTime(r.timestamp)}
                  </td>
                  <td className="px-5 py-3">
                    <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs capitalize text-accent">
                      {r.provider}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-fg-muted">
                    {r.model}
                  </td>
                  <td className="px-5 py-3 text-right font-mono tabular text-fg-muted">
                    {formatTokenCount(r.input_tokens)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono tabular text-fg-muted">
                    {formatTokenCount(r.output_tokens)}
                  </td>
                  <td className="px-5 py-3 text-right font-mono tabular text-fg">
                    {formatCurrency(r.cost, 4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
