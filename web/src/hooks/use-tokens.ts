"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CreatedToken, SyncToken } from "@/lib/types";

export function useTokens() {
  return useQuery({
    queryKey: ["tokens"],
    // Backend returns `null` when the user has no tokens; normalize to [].
    queryFn: async (): Promise<SyncToken[]> => (await api.tokens.list()) ?? [],
  });
}

/**
 * Create a sync token. The raw token is returned once — the caller is
 * responsible for surfacing it (reveal modal) before it's lost.
 */
export function useCreateToken() {
  const queryClient = useQueryClient();
  return useMutation<CreatedToken, Error, string>({
    mutationFn: (name: string) => api.tokens.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useRevokeToken() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id: number) => api.tokens.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}
