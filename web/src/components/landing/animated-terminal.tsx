"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { formatCurrency } from "@/lib/utils";

interface Line {
  path: string;
  model: string;
  cost: number;
  provider: "anthropic" | "openai";
  blocked?: boolean;
}

const BUDGET = 0.25;

// Scripted request stream. Costs accumulate until one would blow the budget —
// that request is blocked instead of charged.
const LINES: Line[] = [
  { path: "POST /v1/messages", model: "claude-sonnet-4-6", cost: 0.0421, provider: "anthropic" },
  { path: "POST /v1/messages", model: "claude-haiku-4-5", cost: 0.0089, provider: "anthropic" },
  { path: "POST /v1/chat/completions", model: "gpt-4o-mini", cost: 0.0143, provider: "openai" },
  { path: "POST /v1/messages", model: "claude-sonnet-4-6", cost: 0.0912, provider: "anthropic" },
  { path: "POST /v1/chat/completions", model: "gpt-4o", cost: 0.2011, provider: "openai", blocked: true },
];

// Cumulative spend after each non-blocked line.
const CUMULATIVE = LINES.reduce<number[]>((acc, line, i) => {
  const prev = i === 0 ? 0 : acc[i - 1];
  acc.push(line.blocked ? prev : prev + line.cost);
  return acc;
}, []);

const FINAL_SPEND = CUMULATIVE[CUMULATIVE.length - 1];

export function AnimatedTerminal() {
  const root = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spendRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const spend = spendRef.current;
      const bar = barRef.current;
      if (!spend || !bar) return;

      const setSpend = (n: number) => {
        spend.textContent = formatCurrency(n, 4);
      };

      if (prefersReducedMotion()) {
        gsap.set(lineRefs.current, { opacity: 1, x: 0 });
        setSpend(FINAL_SPEND);
        gsap.set(bar, { width: `${(FINAL_SPEND / BUDGET) * 100}%` });
        return;
      }

      const counter = { n: 0 };
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.5 });

      // Reset to start of loop.
      tl.set(lineRefs.current, { opacity: 0, x: -8 });
      tl.set(bar, { width: "0%", backgroundColor: "var(--accent)" });
      tl.call(() => {
        counter.n = 0;
        setSpend(0);
      });

      LINES.forEach((line, i) => {
        const el = lineRefs.current[i];
        if (!el) return;
        tl.to(el, { opacity: 1, x: 0, duration: 0.3, ease: "power2.out" }, "+=0.55");

        if (line.blocked) {
          // Flash the frame red; the request is rejected, spend unchanged.
          tl.to(
            frameRef.current,
            {
              boxShadow: "0 0 0 1px var(--danger), 0 0 40px -8px var(--danger)",
              duration: 0.12,
              yoyo: true,
              repeat: 3,
            },
            "<",
          );
          tl.to(bar, { backgroundColor: "var(--danger)", duration: 0.2 }, "<");
        } else {
          const target = CUMULATIVE[i];
          const pct = Math.min((target / BUDGET) * 100, 100);
          const color =
            target / BUDGET >= 0.8
              ? "var(--danger)"
              : target / BUDGET >= 0.5
                ? "var(--warning)"
                : "var(--accent)";
          tl.to(counter, {
            n: target,
            duration: 0.4,
            onUpdate: () => setSpend(counter.n),
          }, "<");
          tl.to(bar, { width: `${pct}%`, backgroundColor: color, duration: 0.4 }, "<");
        }
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="w-[380px] max-w-[86vw]">
      <div ref={frameRef} className="rounded-b-2xl">
        {/* Stream */}
        <div className="space-y-1.5 px-4 py-4 font-mono text-[13px] leading-relaxed">
          {LINES.map((line, i) => (
            <div
              key={i}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              className="flex items-center gap-2 opacity-0"
            >
              {line.blocked ? (
                <>
                  <span className="text-danger">✕ BLOCKED</span>
                  <span className="truncate text-fg-subtle">{line.path}</span>
                  <span className="ml-auto text-danger">over budget</span>
                </>
              ) : (
                <>
                  <span className="text-accent">→</span>
                  <span className="text-fg-muted">{line.path}</span>
                  <span className="hidden text-fg-subtle sm:inline">
                    {line.model}
                  </span>
                  <span className="ml-auto text-fg">
                    {formatCurrency(line.cost, 4)}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Budget footer */}
        <div className="border-t border-border/70 px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between font-mono text-xs">
            <span className="text-fg-subtle">spend</span>
            <span className="text-fg">
              <span ref={spendRef}>{formatCurrency(0, 4)}</span>
              <span className="text-fg-subtle"> / {formatCurrency(BUDGET)}</span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
            <div ref={barRef} className="h-full w-0 rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}
