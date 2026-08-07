"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { ShieldIcon } from "@/components/icons";

/**
 * Client-side gate for the dashboard. The `proxy` already blocks visitors with
 * no session cookie; this validates the cookie against /auth/me and redirects
 * on a definitive 401. On a network/backend error it renders the shell anyway
 * (data panels surface their own reconnect states) rather than bouncing users.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, error } = useAuth();
  const router = useRouter();

  // `user === null` with no error means /auth/me returned 401 → not signed in.
  const unauthenticated = !isLoading && !user && !error;

  useEffect(() => {
    if (unauthenticated) router.replace("/login");
  }, [unauthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <ShieldIcon size={28} className="animate-pulse text-accent" />
      </div>
    );
  }

  if (unauthenticated) return null; // redirecting

  return <>{children}</>;
}
