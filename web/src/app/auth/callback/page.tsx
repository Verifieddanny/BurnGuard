"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function CallbackHandler() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      router.replace("/login");
      return;
    }

    // Set the cookie on this domain (localhost:3000)
    const maxAge = process.env.NEXT_PUBLIC_MAX_AGE ?? "604800";
    document.cookie = `session_id=${sessionId}; path=/; max-age=${maxAge}; samesite=lax`;

    // Now redirect to onboarding or dashboard
    router.replace("/onboarding");
  }, [params, router]);

  return <p className="text-fg-muted">Signing you in…</p>;
}

export default function AuthCallbackPage() {
  // useSearchParams must sit inside a Suspense boundary to prerender.
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Suspense fallback={<p className="text-fg-muted">Signing you in…</p>}>
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
