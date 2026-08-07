"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTokens, useCreateToken, useRevokeToken } from "@/hooks/use-tokens";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { CopyButton } from "@/components/ui/copy-button";
import { formatRelativeTime, formatFullTimestamp } from "@/lib/utils";
import { KeyIcon, PlusIcon, TrashIcon } from "@/components/icons";

export default function TokensPage() {
  const { data: tokens } = useTokens();
  const create = useCreateToken();
  const revoke = useRevokeToken();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);

  const list = tokens ?? [];

  const submit = () => {
    create.mutate(name || "my-proxy", {
      onSuccess: (data) => setRevealed(data.token),
      onError: (e) => toast.error(e.message || "Couldn't create token"),
    });
  };

  const close = () => {
    setOpen(false);
    setName("");
    setRevealed(null);
  };

  const onRevoke = (id: number) => {
    revoke.mutate(id, {
      onError: (e) => toast.error(e.message || "Revoke isn't available yet"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
            Sync tokens
          </h1>
          <p className="text-sm text-fg-muted">
            Connect a proxy to your account.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <PlusIcon size={16} /> Create token
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
          <KeyIcon size={28} className="mx-auto text-fg-subtle" />
          <p className="mt-3 font-medium text-fg">No tokens yet</p>
          <p className="text-sm text-fg-muted">Your proxy is waiting.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-subtle">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 font-medium">Last used</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3 font-medium text-fg">{t.name}</td>
                  <td
                    className="px-5 py-3 text-fg-muted"
                    title={formatFullTimestamp(t.created_at)}
                  >
                    {formatRelativeTime(t.created_at)}
                  </td>
                  <td className="px-5 py-3 text-fg-muted">
                    {t.last_used_at ? formatRelativeTime(t.last_used_at) : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onRevoke(t.id)}
                      aria-label={`Revoke ${t.name}`}
                      className="text-fg-subtle transition-colors hover:text-danger"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / reveal modal */}
      <Modal
        open={open}
        onClose={close}
        title={revealed ? "Save your token" : "Create a token"}
        dismissable={!revealed}
      >
        {revealed ? (
          <div>
            <div className="mb-4 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
              This token won&apos;t be shown again. Copy it now.
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-border bg-bg px-3 py-2.5 font-mono text-sm text-fg">
                {revealed}
              </code>
              <CopyButton value={revealed} label />
            </div>
            <Button onClick={close} className="mt-5 w-full">
              I&apos;ve saved it
            </Button>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Token name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. laptop"
              autoFocus
            />
            <Button
              onClick={submit}
              disabled={create.isPending}
              className="mt-5 w-full"
            >
              {create.isPending ? "Generating…" : "Generate token"}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
