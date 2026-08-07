/*
 * API response types — mirror the Go structs in internal/db_store and the
 * handlers in cmd/server/api. All backend responses are wrapped in
 * `{ "data": ... }` (success) or `{ "error": "..." }` (failure); the API client
 * unwraps `data` before it reaches these types.
 */

/** GET /v1/auth/me — mirrors dbstore.User */
export interface User {
  id: number;
  // Both provider IDs are omitempty on the backend — present only if linked.
  github_id?: number;
  google_id?: string;
  name: string;
  email: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;

  has_passkey?: boolean;
}

/** POST /v1/tokens response */
export interface CreatedToken {
  token: string;
  message: string;
}

/** GET /v1/tokens — mirrors dbstore.SyncToken */
export interface SyncToken {
  id: number;
  user_id: number;
  name: string;
  last_used_at: string | null;
  created_at: string;
}

/** GET /v1/dashboard/summary — mirrors dbstore.DashboardSummary */
export interface DashboardSummary {
  total_spend: number;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
}

/** GET /v1/dashboard/chart — mirrors dbstore.DailySpend */
export interface DailySpend {
  date: string;
  cost: number;
}

/** GET /v1/dashboard/providers — mirrors dbstore.ProviderBreakdown */
export interface ProviderBreakdown {
  provider: string;
  cost: number;
  requests: number;
}

/** GET /v1/dashboard/requests — mirrors dbstore.UsageRecord */
export interface UsageRecord {
  id: number;
  user_id: number;
  sync_token_id: number;
  timestamp: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_creation_tokens: number;
  cache_read_tokens: number;
  cost: number;
  request_path: string;
  synced_at: string;
}

/**
 * Model spend breakdown. The backend has no `/dashboard/models` endpoint yet,
 * so this is derived client-side by aggregating recent UsageRecords by model.
 */
export interface ModelBreakdown {
  model: string;
  provider: string;
  cost: number;
  requests: number;
}


export interface AlertConfig {
  slack_webhook: string;
  discord_webhook: string;
  threshold_50: boolean;
  threshold_80: boolean;
  threshold_100: boolean;
}


export interface Budget {
  amount: number;
}