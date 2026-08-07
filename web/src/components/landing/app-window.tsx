import { cn } from "@/lib/utils";

interface AppWindowProps {
  /** Tab / title label shown in the chrome. */
  title: string;
  /** Optional browser address bar text — renders the laptop "browser" look. */
  url?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * A flat, wide application window — the tactile "laptop screen" object the
 * landing page is built around. Presentational only: it never tilts and never
 * moves; interactivity lives in the components rendered inside it.
 */
export function AppWindow({ title, url, children, className }: AppWindowProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface",
        className,
      )}
      style={{
        boxShadow:
          "0 40px 90px -40px rgba(0,0,0,0.6), 0 0 0 1px var(--border)",
      }}
    >
      {/* Chrome */}
      <div className="flex items-center gap-3 border-b border-border/70 bg-elevated/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        {url ? (
          <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-lg border border-border bg-bg/60 px-3 py-1 font-mono text-xs text-fg-subtle">
            <span className="h-3 w-3 rounded-full border border-fg-subtle/50" />
            {url}
          </div>
        ) : (
          <span className="font-mono text-xs text-fg-subtle">{title}</span>
        )}
        {url && (
          <span className="hidden font-mono text-xs text-fg-subtle sm:block">
            {title}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}
