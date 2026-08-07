"use client";

import { useState } from "react";
import {
  ShieldIcon,
  ChartLineIcon,
  KeyIcon,
  BellIcon,
  SettingsIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  type IconProps,
} from "@/components/icons";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import { AppWindow } from "./app-window";
import { DashboardPage } from "./dashboard-canvas";

type Page = "dashboard" | "tokens" | "alerts" | "settings";

const NAV: { id: Page; label: string; icon: (p: IconProps) => React.ReactNode }[] =
  [
    { id: "dashboard", label: "Dashboard", icon: ChartLineIcon },
    { id: "tokens", label: "Tokens", icon: KeyIcon },
    { id: "alerts", label: "Alerts", icon: BellIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ];

/**
 * The landing page's centerpiece: a real, clickable mini-app inside a laptop
 * window. The left rail routes between pages (the URL bar updates to match),
 * the dashboard has draggable widgets and live cursors, and the other pages are
 * genuinely interactive — create a token, toggle alerts, edit settings.
 */
export function InteractiveWindow() {
  const [page, setPage] = useState<Page>("dashboard");

  return (
    <AppWindow title="BurnGuard" url={`app.burnguard.run/${page}`}>
      <div className="overflow-x-auto">
        <div className="flex min-w-180">
          {/* Rail */}
          <aside className="flex w-14 shrink-0 flex-col items-center gap-1 border-r border-border/70 bg-elevated/30 py-4">
            <ShieldIcon size={22} className="mb-4 text-accent" />
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPage(id)}
                aria-label={label}
                aria-current={page === id}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150",
                  page === id
                    ? "bg-accent/15 text-accent"
                    : "text-fg-subtle hover:bg-elevated hover:text-fg",
                )}
              >
                <Icon size={18} />
              </button>
            ))}
          </aside>

          {/* Stage */}
          <div
            className={cn(
              "relative h-107.5 flex-1",
              page === "dashboard" ? "overflow-hidden" : "overflow-y-auto",
            )}
          >
            {page === "dashboard" ? (
              <DashboardPage />
            ) : (
              <div key={page} className="app-page-in min-h-full p-5">
                {page === "tokens" && <TokensPage />}
                {page === "alerts" && <AlertsPage />}
                {page === "settings" && <SettingsPage />}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppWindow>
  );
}

/* ------------------------------------------------------------------ *
 * Pages
 * ------------------------------------------------------------------ */

function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold text-fg">{title}</h3>
        <p className="text-sm text-fg-subtle">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

interface Token {
  id: number;
  name: string;
  created: string;
  lastUsed: string;
}

function randomToken() {
  const hex = Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
  return `bg_${hex}`;
}

function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([
    { id: 1, name: "laptop", created: "Aug 1", lastUsed: "2h ago" },
    { id: 2, name: "ci-runner", created: "Jul 24", lastUsed: "Yesterday" },
  ]);
  const [revealed, setRevealed] = useState<string | null>(null);

  const create = () => {
    const raw = randomToken();
    setRevealed(raw);
    setTokens((t) => [
      { id: Date.now(), name: "new-token", created: "Just now", lastUsed: "—" },
      ...t,
    ]);
  };

  return (
    <div>
      <PageHeader
        title="Sync tokens"
        subtitle="Connect a proxy to your account."
        action={
          <button
            type="button"
            onClick={create}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-3 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            <PlusIcon size={15} /> New token
          </button>
        }
      />

      {revealed && (
        <div className="mb-4 rounded-xl border border-accent/40 bg-accent/5 p-3">
          <p className="mb-2 text-xs font-medium text-accent">
            Save this token — you won&apos;t see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg border border-border bg-bg px-3 py-2 font-mono text-xs text-fg">
              {revealed}
            </code>
            <CopyButton value={revealed} />
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border">
        {tokens.map((t, i) => (
          <div
            key={t.id}
            className={cn(
              "flex items-center gap-4 px-4 py-3 text-sm",
              i > 0 && "border-t border-border",
            )}
          >
            <KeyIcon size={16} className="text-fg-subtle" />
            <span className="font-medium text-fg">{t.name}</span>
            <span className="ml-auto font-mono text-xs text-fg-subtle">
              {t.created} · used {t.lastUsed}
            </span>
            <button
              type="button"
              onClick={() => setTokens((list) => list.filter((x) => x.id !== t.id))}
              aria-label={`Revoke ${t.name}`}
              className="text-fg-subtle transition-colors hover:text-danger"
            >
              <TrashIcon size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const THRESHOLDS = [50, 80, 100] as const;

function AlertsPage() {
  const [active, setActive] = useState<Record<number, boolean>>({
    50: true,
    80: true,
    100: false,
  });
  const [slack, setSlack] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <PageHeader title="Alerts" subtitle="Get pinged before the burn." />

      <p className="mb-2 text-sm font-medium text-fg">Notify me at</p>
      <div className="mb-5 flex gap-2">
        {THRESHOLDS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActive((a) => ({ ...a, [t]: !a[t] }))}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
              active[t]
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border text-fg-muted hover:bg-elevated",
            )}
          >
            {active[t] && <CheckIcon size={13} />}
            {t}% of budget
          </button>
        ))}
      </div>

      <label className="mb-1 block text-sm font-medium text-fg">
        Slack webhook
      </label>
      <input
        value={slack}
        onChange={(e) => setSlack(e.target.value)}
        placeholder="https://hooks.slack.com/services/…"
        className="mb-4 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-subtle focus:border-accent"
      />

      <button
        type="button"
        onClick={() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 1600);
        }}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
      >
        {saved ? <CheckIcon size={15} /> : null}
        {saved ? "Saved" : "Save alerts"}
      </button>
    </div>
  );
}

function SettingsPage() {
  const [budget, setBudget] = useState(75);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Account & budget." />

      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 font-mono text-accent">
          D
        </span>
        <div className="text-sm">
          <p className="font-medium text-fg">Danny</p>
          <p className="font-mono text-xs text-fg-subtle">you@users.github</p>
        </div>
        <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-xs text-fg-subtle">
          GitHub
        </span>
      </div>

      <label className="mb-1 block text-sm font-medium text-fg">
        Monthly budget
      </label>
      <div className="flex items-center gap-2">
        <span className="font-mono text-fg-subtle">$</span>
        <input
          type="number"
          min={0}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value) || 0)}
          className="w-28 rounded-lg border border-border bg-bg px-3 py-2 text-right font-mono tabular text-fg outline-none focus:border-accent"
        />
        <span className="text-sm text-fg-subtle">/ month</span>
      </div>

      <div className="mt-6 rounded-xl border border-danger/30 bg-danger/5 p-3">
        <p className="text-sm font-medium text-fg">Danger zone</p>
        <button
          type="button"
          className="mt-2 rounded-lg border border-danger/40 px-3 py-1.5 text-sm text-danger transition-colors hover:bg-danger/10"
        >
          Delete account
        </button>
      </div>
    </div>
  );
}
