"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

interface Collaborator {
  name: string;
  color: string;
  /** Waypoints as [xPct, yPct] of the stage, looped. */
  path: [number, number][];
}

const COLLABORATORS: Collaborator[] = [
  {
    name: "you",
    color: "var(--accent)",
    path: [
      [18, 30],
      [62, 22],
      [70, 60],
      [30, 66],
      [18, 30],
    ],
  },
  {
    name: "aria",
    color: "#9a8f81",
    path: [
      [78, 68],
      [40, 40],
      [24, 74],
      [80, 34],
      [78, 68],
    ],
  },
];

function Cursor({ color, name }: { color: string; name: string }) {
  return (
    <div className="pointer-events-none absolute left-0 top-0 -translate-x-1 -translate-y-1">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 2l6.5 15 2.2-6.3L18 8.5 3 2z"
          fill={color}
          stroke="var(--bg-primary)"
          strokeWidth="1"
        />
      </svg>
      <span
        className="ml-3 -mt-1 inline-block rounded-md px-1.5 py-0.5 font-mono text-[10px] text-white"
        style={{ background: color }}
      >
        {name}
      </span>
    </div>
  );
}

/**
 * Ambient multiplayer cursors drifting across the app window, like a live
 * collaborative session. Purely decorative motion — disabled for reduced-motion.
 */
export function LiveCursors() {
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !stage.current) return;
      const w = stage.current.clientWidth;
      const h = stage.current.clientHeight;
      const cursors = gsap.utils.toArray<HTMLElement>("[data-cursor]");

      cursors.forEach((el, i) => {
        const { path } = COLLABORATORS[i];
        const tl = gsap.timeline({ repeat: -1, delay: i * 1.2 });
        path.forEach(([px, py], j) => {
          tl.to(el, {
            x: (px / 100) * w,
            y: (py / 100) * h,
            duration: 2.2 + (j % 2) * 0.6,
            ease: "power1.inOut",
          });
        });
      });
    },
    { scope: stage },
  );

  return (
    <div ref={stage} className="pointer-events-none absolute inset-0 z-[900]">
      {COLLABORATORS.map((c) => (
        <div key={c.name} data-cursor className="absolute left-0 top-0">
          <Cursor color={c.color} name={c.name} />
        </div>
      ))}
    </div>
  );
}
