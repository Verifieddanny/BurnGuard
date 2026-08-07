/** Backend API base URL. Endpoints live under `${API_URL}/v1`. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** Public URL of this frontend, used for OAuth redirects. */
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/** localStorage key for the persisted theme preference. */
export const THEME_STORAGE_KEY = "burnguard-theme";

/** Provider brand accent colors, used for pills, charts, and breakdowns. */
export const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "#d97757",
  openai: "#10a37f",
  google: "#4285f4",
};

export function providerColor(provider: string): string {
  return PROVIDER_COLORS[provider.toLowerCase()] ?? "var(--accent)";
}
