"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";

/**
 * Current authenticated user. A 401 resolves to `user: null` rather than an
 * error, so pages can branch on auth state cleanly.
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const query = useQuery<User | null>({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        return await api.auth.me();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) return null;
        throw err;
      }
    },
    staleTime: 5 * 60_000,
  });

  const refetchUser = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }, [queryClient]);

  return {
    user: query.data ?? null,
    isAuthenticated: !!query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetchUser,
  };
}

/** Start GitHub OAuth by navigating to the backend authorize endpoint. */
export function loginWithGithub() {
  window.location.href = api.auth.githubUrl();
}

/** Start Google OAuth by navigating to the backend authorize endpoint. */
export function loginWithGoogle() {
  window.location.href = api.auth.googleUrl();
}

/**
 * Client-side sign-out: clears cached auth/data and returns to login.
 * NOTE: the backend has no logout endpoint yet, so the HttpOnly `session_id`
 * cookie can't be cleared from JS — add `POST /v1/auth/logout` to fully revoke.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useCallback(() => {
    queryClient.clear();
    router.replace("/login");
  }, [queryClient, router]);
}
