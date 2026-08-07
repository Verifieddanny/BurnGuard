import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import { API_URL } from "./constants";
import type {
  AlertConfig,
  Budget,
  CreatedToken,
  DailySpend,
  DashboardSummary,
  ProviderBreakdown,
  SyncToken,
  UsageRecord,
  User,
} from "./types";

/** Thrown when the backend returns a non-2xx response. Carries the HTTP status. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Core fetch wrapper. Sends the session cookie, unwraps the `{ data }`
 * envelope, and throws an {@link ApiError} on failure.
 */
export async function fetchAPI<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {

  const sessionId = getSessionId();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  if (sessionId) {
    headers["Authorization"] = `Bearer ${sessionId}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/v1${path}`, { ...options, headers });
  } catch {
    throw new ApiError("Network error — is the API running?", 0);
  }

  if (!res.ok) {
    let message = "Something went wrong";
    try {
      const body = await res.json();
      message = body.error || message;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(message, res.status);
  }

  // 204 / empty bodies
  if (res.status === 204) return undefined as T;

  const json = await res.json();
  return json.data as T;
}

/* ------------------------------------------------------------------ *
 * Typed endpoint helpers
 * ------------------------------------------------------------------ */

export const api = {
  auth: {
    me: () => fetchAPI<User>("/auth/me"),
    /** OAuth flows are full-page redirects, not fetches. */
    githubUrl: () => `${API_URL}/v1/auth/github`,
    googleUrl: () => `${API_URL}/v1/auth/google`,
  },

  passkey: {
    // Registration requires an active session (Bearer token sent automatically).
    registerBegin: () =>
      fetchAPI<PublicKeyCredentialCreationOptionsJSON>(
        "/auth/passkey/register/begin",
        { method: "POST" },
      ),
    registerFinish: (credential: RegistrationResponseJSON) =>
      fetchAPI<void>("/auth/passkey/register/finish", {
        method: "POST",
        body: JSON.stringify(credential),
      }),
    // Login is public — no session needed.
    loginBegin: () =>
      fetchAPI<PublicKeyCredentialRequestOptionsJSON>(
        "/auth/passkey/login/begin",
        { method: "POST" },
      ),
    loginFinish: (credential: AuthenticationResponseJSON) =>
      fetchAPI<{ session_id: string }>("/auth/passkey/login/finish", {
        method: "POST",
        body: JSON.stringify(credential),
      }),
  },

  tokens: {
    list: () => fetchAPI<SyncToken[]>("/tokens"),
    create: (name: string) =>
      fetchAPI<CreatedToken>("/tokens", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    // NOTE: needs `DELETE /v1/tokens/{id}` mounted on the backend (the
    // SyncToken.Delete store method exists, but no route/handler yet).
    revoke: (id: number) =>
      fetchAPI<void>(`/tokens/${id}`, { method: "DELETE" }),
  },

  dashboard: {
    summary: () => fetchAPI<DashboardSummary>("/dashboard/summary"),
    chart: (days = 30) =>
      fetchAPI<DailySpend[]>(`/dashboard/chart?days=${days}`),
    providers: () => fetchAPI<ProviderBreakdown[]>("/dashboard/providers"),
    requests: (limit = 20) =>
      fetchAPI<UsageRecord[]>(`/dashboard/requests?limit=${limit}`),
  },

  alerts: {
    getConfig: () => fetchAPI<AlertConfig>("/alerts/config"),
    updateConfig: (config: AlertConfig) =>
      fetchAPI<AlertConfig>("/alerts/config", {
        method: "PUT",
        body: JSON.stringify(config),
      }),
  },

  budget: {
    get: () => fetchAPI<Budget>("/budget"),
    set: (amount: number) =>
      fetchAPI<{ message: string }>("/budget", {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),
    update: (amount: number) =>
      fetchAPI<{ message: string }>("/budget", {
        method: "PUT",
        body: JSON.stringify({ amount }),
      }),
  },
};


function getSessionId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/session_id=([^;]+)/);
  return match ? match[1] : null;
}