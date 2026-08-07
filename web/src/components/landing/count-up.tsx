"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface CountUpProps {
  /** Final value to count to. */
  value: number;
  prefix?: string;
  suffix?: string;
  /** Decimal places to display. */
  decimals?: number;
  duration?: number;
  className?: string;
}

function format(n: number, decimals: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Counts up from 0 to `value` when scrolled into view (GSAP ScrollTrigger).
 * With reduced motion, renders the final value immediately.
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 2,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        el.textContent = `${prefix}${format(value, decimals)}${suffix}`;
        return;
      }

      const counter = { n: 0 };
      gsap.to(counter, {
        n: value,
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${format(counter.n, decimals)}${suffix}`;
        },
      });
    },
    { scope: ref, dependencies: [value] },
  );

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {/* Static fallback before JS / for no-JS crawlers */}
      {prefix}
      {format(value, decimals)}
      {suffix}
    </span>
  );
}
