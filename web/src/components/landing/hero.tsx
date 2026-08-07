"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/icons";
import { InteractiveWindow } from "./interactive-window";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-hero-item]", {
        opacity: 0,
        y: 26,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.05,
      });
      gsap.from("[data-hero-window]", {
        opacity: 0,
        y: 60,
        scale: 0.97,
        duration: 1.1,
        ease: "power3.out",
        delay: 0.3,
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative px-6 pb-28 pt-36 sm:pt-44">
      {/* Centered copy */}
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <span
          data-hero-item
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 font-mono text-xs text-fg-muted"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          v1.0 — the AI spend firewall
        </span>

        <h1
          data-hero-item
          className="font-display text-[2.9rem] font-semibold leading-[0.95] tracking-[-0.035em] text-fg sm:text-6xl lg:text-[4.75rem]"
        >
          Never get a surprise{" "}
          <span className="text-accent">AI bill</span> again.
        </h1>

        <p
          data-hero-item
          className="mt-7 max-w-xl text-lg leading-relaxed text-fg-muted"
        >
          BurnGuard sits between your app and every AI provider — metering each
          request in real time and slamming the door the instant you hit your
          budget.
        </p>

        <div
          data-hero-item
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Button href="/login" size="lg">
            Protect Your Wallet
            <ArrowRightIcon size={18} />
          </Button>
          <Button href="/#how-it-works" variant="secondary" size="lg">
            How it works
          </Button>
        </div>

        <p
          data-hero-item
          className="mt-6 font-mono text-xs text-fg-subtle"
        >
          brew install burnguard · one line, zero SDK changes
        </p>
      </div>

      {/* Wide laptop window — a clickable mini-app */}
      <div data-hero-window className="mx-auto mt-16 max-w-5xl">
        <InteractiveWindow />
        <p className="mt-4 text-center font-mono text-xs text-fg-subtle">
          click around · drag the cards · edit the budget · it&apos;s live
        </p>
      </div>
    </section>
  );
}
