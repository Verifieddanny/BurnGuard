import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { api } from "./api";

const MAX_AGE = 7 * 24 * 60 * 60; // 7 days, matching the OAuth cookie

/**
 * Register a passkey for the currently signed-in user. Requires an active
 * session (the Bearer token is attached by the API client).
 */
export async function registerPasskey(): Promise<void> {
  const response = await api.passkey.registerBegin();
  // The backend wraps in {publicKey: {...}} — simplewebauthn wants the inner object
  const optionsJSON = (response as any).publicKey ?? response;
  const credential = await startRegistration({ optionsJSON });
  await api.passkey.registerFinish(credential);
}

/**
 * Sign in with a passkey (no existing session). On success, sets the readable
 * session cookie — same shape as the OAuth callback — and lands on the dashboard.
 */
export async function loginWithPasskey(): Promise<void> {
  const response = await api.passkey.loginBegin();
  const optionsJSON = (response as any).publicKey ?? response;
  const credential = await startAuthentication({ optionsJSON });
  const { session_id } = await api.passkey.loginFinish(credential);
  document.cookie = `session_id=${session_id}; path=/; max-age=${MAX_AGE}; samesite=lax`;
  window.location.href = "/dashboard";
}
