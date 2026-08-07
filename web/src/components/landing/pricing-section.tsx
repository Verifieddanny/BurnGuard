"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type Cycle = "monthly" | "yearly";

const PLANS = [
  {
    name: "Free",
    tagline: "For solo builders and side projects.",
    monthly: 0,
    yearly: 0,
    cta: "Start free",
    popular: false,
    features: [
      "1 sync token",
      "7-day spend history",
      "Real-time tracking",
      "Single provider",
      "Community support",
    ],
  },
  {
    name: "Pro",
    tagline: "For teams shipping on AI in production.",
    monthly: 19,
    yearly: 15,
    cta: "Protect Your Wallet",
    popular: true,
    features: [
      "Unlimited sync tokens",
      "Unlimited history",
      "Hard budget enforcement",
      "All providers unified",
      "Slack + Discord alerts",
      "Priority support",
    ],
  },
];

export function PricingSection() {
  const [cycle, setCycle] = useState<Cycle>("yearly");

  return (
    <section id="pricing" className="px-6 py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal stagger className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Costs less than one runaway request
          </h2>
          <p className="mt-4 text-lg text-fg-muted">
            Start free. Upgrade when the budget guardrails become non-negotiable.
          </p>

          {/* Cycle toggle */}
          <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1">
            {(["monthly", "yearly"] as Cycle[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors duration-150",
                  cycle === c
                    ? "bg-accent text-accent-ink"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {c}
                {c === "yearly" && (
                  <span
                    className={cn(
                      "ml-1.5 text-xs",
                      cycle === "yearly" ? "text-accent-ink/70" : "text-accent",
                    )}
                  >
                    −20%
                  </span>
                )}
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal stagger className="mt-12 grid gap-6 md:grid-cols-2">
          {PLANS.map((plan) => {
            const price = cycle === "monthly" ? plan.monthly : plan.yearly;
            return (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-surface p-8",
                  plan.popular
                    ? "border-accent/50"
                    : "border-border",
                )}
                style={
                  plan.popular
                    ? { boxShadow: "0 0 0 1px var(--accent), 0 0 60px -20px var(--accent)" }
                    : undefined
                }
              >
                {plan.popular && (
                  <Badge tone="accent" className="absolute -top-3 left-8 bg-accent text-accent-ink">
                    Popular
                  </Badge>
                )}

                <h3 className="text-lg font-semibold text-fg">{plan.name}</h3>
                <p className="mt-1 text-sm text-fg-muted">{plan.tagline}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-semibold text-fg">
                    ${price}
                  </span>
                  <span className="text-sm text-fg-subtle">/ month</span>
                </div>
                {cycle === "yearly" && plan.yearly > 0 && (
                  <p className="mt-1 text-xs text-fg-subtle">
                    billed annually
                  </p>
                )}

                <Button
                  href="/login"
                  variant={plan.popular ? "primary" : "secondary"}
                  size="lg"
                  className="mt-6 w-full"
                >
                  {plan.cta}
                </Button>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-3 text-sm text-fg-muted"
                    >
                      <CheckIcon
                        size={16}
                        className="shrink-0 text-accent"
                      />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
