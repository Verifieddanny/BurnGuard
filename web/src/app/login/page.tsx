"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { loginWithGithub, loginWithGoogle } from "@/hooks/use-auth";
import { loginWithPasskey } from "@/lib/passkey";
import {
  GithubIcon,
  GoogleIcon,
  FingerprintIcon,
  ShieldIcon,
  CheckIcon,
} from "@/components/icons";

export default function LoginPage() {
  const root = useRef<HTMLDivElement>(null);
  const [passkeyPending, setPasskeyPending] = useState(false);

  const onPasskey = async () => {
    setPasskeyPending(true);
    try {
      await loginWithPasskey();
    } catch {
      // User cancelled or no passkey available for this site.
      toast.error("Passkey sign-in was cancelled or failed");
      setPasskeyPending(false);
    }
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-login-card] > *", {
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.07,
        delay: 0.1,
      });
      // Shield "draws" itself in on load.
      const path = root.current?.querySelector<SVGPathElement>("[data-draw]");
      if (path) {
        const len = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" },
        );
      }
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid min-h-dvh lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-accent p-12 lg:flex">
        <Logo href="/" className="[&_*]:text-accent-ink" />
        <div>
          <svg
            width="72"
            height="72"
            viewBox="0 0 24 24"
            fill="none"
            className="mb-8 text-accent-ink"
          >
            <path
              data-draw
              d="M12 2.4l7.4 3v5.3c0 4.7-3.2 8-7.4 9.3-4.2-1.3-7.4-4.6-7.4-9.3V5.4l7.4-3z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="max-w-md font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-accent-ink">
            The firewall for your AI spend.
          </h1>
          <p className="mt-4 max-w-sm text-accent-ink/70">
            Real-time metering, hard budget caps, and a kill switch — sitting
            quietly between your app and every provider.
          </p>
        </div>
        <p className="font-mono text-xs text-accent-ink/60">
          brew install burnguard
        </p>
      </aside>

      {/* Sign-in */}
      <section className="relative flex items-center justify-center p-6">
        <div className="absolute right-6 top-6 flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-fg-muted transition-colors hover:text-fg"
          >
            Back
          </Link>
          <ThemeToggle />
        </div>

        <div
          data-login-card
          className="w-full max-w-sm rounded-2xl border border-border bg-surface/70 p-8 backdrop-blur-xl"
        >
          <div className="lg:hidden">
            <Logo href="/" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-fg">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-fg-muted">
            Sign in to guard your wallet.
          </p>

          {/* GitHub — the one that works */}
          <button
            type="button"
            onClick={loginWithGithub}
            className="group relative my-8 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-fg font-semibold text-bg transition-transform duration-150 active:scale-[0.98] cursor-pointer"
          >
            <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" />
            <GithubIcon size={18} />
            Continue with GitHub
          </button>

          <button
            type="button"
            onClick={loginWithGoogle}
            className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-fg transition-colors duration-150 hover:bg-elevated active:scale-[0.98] cursor-pointer"
          >
            <GoogleIcon size={18} />
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-fg-subtle">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={onPasskey}
            disabled={passkeyPending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-fg transition-colors duration-150 hover:bg-elevated active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            <FingerprintIcon size={18} />
            {passkeyPending ? "Waiting for passkey…" : "Use a passkey"}
          </button>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-fg-subtle">
            <ShieldIcon size={13} className="text-accent" />
            Keys stay on your machine
            <CheckIcon size={13} className="text-success" />
          </p>
          <p className="mt-3 text-center text-xs text-fg-subtle">
            By signing in, you agree to our Terms of Service.
          </p>
        </div>
      </section>
    </div>
  );
}
