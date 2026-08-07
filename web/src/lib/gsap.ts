"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register plugins once, on the client. ScrollTrigger drives all scroll-based
// reveals and counters; useGSAP scopes animations and handles cleanup.
gsap.registerPlugin(ScrollTrigger, useGSAP);

/** True when the user prefers reduced motion (SSR-safe: false on the server). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, useGSAP };
