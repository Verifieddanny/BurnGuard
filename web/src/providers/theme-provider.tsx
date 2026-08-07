"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { THEME_STORAGE_KEY } from "@/lib/constants";

export type ThemePreference = "dark" | "light" | "system";
type ResolvedTheme = "dark" | "light";

interface ThemeContextValue {
  /** The user's stored preference (may be "system"). */
  theme: ThemePreference;
  /** The actual applied theme after resolving "system". */
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
  /** Flip between dark and light (used by the sun/moon toggle). */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(resolved);
}

function storedPreference(): ThemePreference {
  if (typeof window === "undefined") return "dark";
  return (
    (localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null) ??
    "system"
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Lazy initializers read the stored preference on the client's first render,
  // matching the no-flash script — no setState-in-effect needed. On the server
  // they fall back to "dark" (the default), reconciled by the toggle's mount
  // check where it matters.
  const [theme, setThemeState] = useState<ThemePreference>(storedPreference);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const pref = storedPreference();
    return pref === "system" ? systemTheme() : pref;
  });

  // Keep the <html> class in sync with the resolved theme (external DOM update).
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  // Follow OS changes while the preference is "system".
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(systemTheme());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setResolvedTheme(next === "system" ? systemTheme() : next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme, setTheme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}

/**
 * Inline script injected before hydration to set the theme class immediately,
 * preventing a flash of the wrong theme. Kept in sync with THEME_STORAGE_KEY.
 */
export const themeNoFlashScript = `
(function() {
  try {
    var pref = localStorage.getItem('${THEME_STORAGE_KEY}') || 'system';
    var dark = pref === 'dark' || (pref === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.add(dark ? 'dark' : 'light');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;
