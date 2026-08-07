"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger direct children in sequence rather than animating as one block. */
  stagger?: boolean;
  /** Delay before the reveal starts, in seconds. */
  delay?: number;
  /** Element tag to render. Defaults to div. */
  as?: "div" | "section" | "ul" | "header";
}

/**
 * Fades content up as it scrolls into view (GSAP ScrollTrigger). With
 * `stagger`, direct children animate in sequence (50ms apart) so the block
 * "builds" itself. Respects prefers-reduced-motion by rendering statically.
 */
export function Reveal({
  children,
  className,
  stagger = false,
  delay = 0,
  as = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as;

  useGSAP(
    () => {
      const el = ref.current;
      if (prefersReducedMotion() || !el) return;

      const targets = stagger
        ? (gsap.utils.toArray(el.children) as Element[])
        : [el];

      gsap.set(targets, { opacity: 0, y: 24 });
      const reveal = () =>
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          delay,
          stagger: stagger ? 0.05 : 0,
          overwrite: "auto",
        });

      // Reveal on scroll-in, but also immediately if this block is already in
      // or past the viewport — so an anchor jump that skips it can't leave it
      // permanently hidden.
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: reveal,
      });
      if (el.getBoundingClientRect().top < window.innerHeight * 0.9) reveal();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as never} className={cn(className)}>
      {children}
    </Tag>
  );
}
