"use client";

import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};

/** True only after client hydration; false during SSR and the first paint. */
function useMounted() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Sun/moon theme toggle. Renders a stable placeholder until mounted to avoid a
 * hydration mismatch (the resolved theme is only known on the client).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      // Gate on `mounted` so the SSR label matches the first client render.
      aria-label={
        mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"
      }
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border",
        "text-fg-muted transition-colors duration-150",
        "hover:bg-elevated hover:text-fg",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      {mounted && isDark ? (
        <MoonIcon size={18} />
      ) : (
        <SunIcon size={18} />
      )}
    </button>
  );
}
