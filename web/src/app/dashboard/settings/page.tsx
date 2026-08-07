"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useBudget, useUpdateBudget } from "@/hooks/use-budget";
import { useAlertConfig, useUpdateAlertConfig } from "@/hooks/use-alerts";
import { registerPasskey } from "@/lib/passkey";
import type { AlertConfig } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { CheckIcon, GithubIcon, GoogleIcon, FingerprintIcon } from "@/components/icons";

const THRESHOLDS = [50, 80, 100] as const;

function Section({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-semibold text-fg">{title}</h2>
      <p className="mb-4 text-sm text-fg-muted">{desc}</p>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { user, refetchUser } = useAuth();

  const { data: budget } = useBudget();
  const updateBudget = useUpdateBudget();
  const [budgetDraft, setBudgetDraft] = useState<string>("");

  const { data: alertCfg } = useAlertConfig();
  const updateAlerts = useUpdateAlertConfig();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [passkeyBusy, setPasskeyBusy] = useState(false);
  const [passkeyDone, setPasskeyDone] = useState(false);

  const hasPasskey = !!user?.has_passkey;

  const setupPasskey = async () => {
    setPasskeyBusy(true);
    try {
      await registerPasskey();
      setPasskeyDone(true);
      toast.success("Passkey registered");
      await refetchUser();
    } catch (err) {
      console.error("Passkey error:", err);
      toast.error(err instanceof Error ? err.message : "Passkey setup failed");
    } finally {
      setPasskeyBusy(false);
    }
};

  const initial = (user?.name ?? "A").charAt(0).toUpperCase();
  const effectiveBudget =
    budgetDraft === "" ? (budget?.amount ?? 0) : Number(budgetDraft);

  const saveBudget = () => {
    updateBudget.mutate(effectiveBudget || 0, {
      onSuccess: () => {
        setBudgetDraft("");
        toast.success("Budget saved");
      },
      onError: (e) => toast.error(e.message || "Couldn't save budget"),
    });
  };

  const saveAlerts = (config: AlertConfig) => {
    updateAlerts.mutate(config, {
      onSuccess: () => toast.success("Alert preferences saved"),
      onError: (e) => toast.error(e.message || "Couldn't save alerts"),
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
          Settings
        </h1>
        <p className="text-sm text-fg-muted">Account, budget & alerts.</p>
      </div>

      <Section title="Profile" desc="Pulled from your GitHub account.">
        <div className="flex items-center gap-4">
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 font-mono text-lg text-accent">
              {initial}
            </span>
          )}
          <div className="text-sm">
            <p className="font-medium text-fg">{user?.name ?? "—"}</p>
            <p className="font-mono text-xs text-fg-subtle">
              {user?.email ?? "—"}
            </p>
          </div>
        </div>
      </Section>

      <Section title="Budget" desc="Requests over this monthly cap are blocked.">
        <div className="flex items-end gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Monthly limit (USD)
            </label>
            <Input
              type="number"
              min={0}
              value={effectiveBudget}
              onChange={(e) => setBudgetDraft(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={saveBudget} disabled={updateBudget.isPending}>
            {updateBudget.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </Section>

      <Section title="Alerts" desc="Get pinged before you hit the cap.">
        <AlertsForm
          // Remount to reseed the form once the server config arrives.
          key={alertCfg ? "loaded" : "default"}
          initial={alertCfg ?? null}
          pending={updateAlerts.isPending}
          onSave={saveAlerts}
        />
      </Section>

      <Section title="Authentication" desc="How you sign in.">
        <div className="space-y-2 text-sm">
          <ProviderRow
            icon={<GithubIcon size={18} />}
            label="GitHub"
            connected={!!user?.github_id}
          />
          <ProviderRow
            icon={<GoogleIcon size={18} />}
            label="Google"
            connected={!!user?.google_id}
          />

          {/* Passkey — register for the current session */}
          <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
            <FingerprintIcon size={18} className="text-fg" />
            <span className="text-fg">Passkey</span>
            {hasPasskey ? (
              <span className="ml-auto flex items-center gap-1 text-xs text-success">
                <CheckIcon size={13} /> Registered
              </span>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="ml-auto"
                disabled={passkeyBusy}
                onClick={setupPasskey}
              >
                {passkeyBusy ? "Waiting…" : "Set up passkey"}
              </Button>
            )}
          </div>
        </div>
      </Section>

      <Section title="Danger zone" desc="Irreversible account actions.">
        <Button variant="danger" onClick={() => setConfirmDelete(true)}>
          Delete account
        </Button>
      </Section>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete account?"
      >
        <p className="text-sm text-fg-muted">
          This permanently removes your account, tokens, and usage history. This
          can&apos;t be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmDelete(false);
              toast.error("Account deletion isn't wired up yet");
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ProviderRow({
  icon,
  label,
  connected,
}: {
  icon: React.ReactNode;
  label: string;
  connected: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
      <span className="text-fg">{icon}</span>
      <span className="text-fg">{label}</span>
      {connected ? (
        <span className="ml-auto flex items-center gap-1 text-xs text-success">
          <CheckIcon size={13} /> Connected
        </span>
      ) : (
        <span className="ml-auto text-xs text-fg-subtle">Not connected</span>
      )}
    </div>
  );
}

/**
 * Alert preferences form. Seeds its own state from `initial` via useState
 * initializers (no effect); the parent remounts it with a `key` when the server
 * config loads so the fields reflect saved values.
 */
function AlertsForm({
  initial,
  pending,
  onSave,
}: {
  initial: AlertConfig | null;
  pending: boolean;
  onSave: (config: AlertConfig) => void;
}) {
  const [slack, setSlack] = useState(initial?.slack_webhook ?? "");
  const [discord, setDiscord] = useState(initial?.discord_webhook ?? "");
  const [active, setActive] = useState<Record<number, boolean>>({
    50: initial?.threshold_50 ?? true,
    80: initial?.threshold_80 ?? true,
    100: initial?.threshold_100 ?? false,
  });

  return (
    <>
      <p className="mb-2 text-sm font-medium text-fg">Notify me at</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {THRESHOLDS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActive((a) => ({ ...a, [t]: !a[t] }))}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              active[t]
                ? "border-accent/40 bg-accent/10 text-accent"
                : "border-border text-fg-muted hover:bg-elevated"
            }`}
          >
            {active[t] && <CheckIcon size={13} />}
            {t}%
          </button>
        ))}
      </div>
      <div className="space-y-3">
        <Input
          value={slack}
          onChange={(e) => setSlack(e.target.value)}
          placeholder="Slack webhook URL"
        />
        <Input
          value={discord}
          onChange={(e) => setDiscord(e.target.value)}
          placeholder="Discord webhook URL"
        />
      </div>
      <Button
        variant="secondary"
        className="mt-4"
        disabled={pending}
        onClick={() =>
          onSave({
            slack_webhook: slack,
            discord_webhook: discord,
            threshold_50: active[50],
            threshold_80: active[80],
            threshold_100: active[100],
          })
        }
      >
        {pending ? "Saving…" : "Save alerts"}
      </Button>
    </>
  );
}
