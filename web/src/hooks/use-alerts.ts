"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AlertConfig } from "@/lib/types";

/** Alert configuration, from `GET /v1/alerts/config`. */
export function useAlertConfig() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: api.alerts.getConfig,
  });
}

/** Update webhook URLs and threshold toggles via `PUT /v1/alerts/config`. */
export function useUpdateAlertConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (config: AlertConfig) => api.alerts.updateConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
