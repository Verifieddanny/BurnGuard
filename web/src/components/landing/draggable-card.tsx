"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

let zCounter = 10;

interface DraggableCardProps {
  /** Initial position within the parent stage, in px. */
  x: number;
  y: number;
  children: React.ReactNode;
  className?: string;
  /** Small caption shown on the drag rail (e.g. "spend"). */
  label?: string;
}

/**
 * A widget inside the app window that the user can pick up and rearrange.
 * Absolutely positioned within its stage and clamped to the stage bounds so it
 * can't be dragged out of the window. Interactive children (inputs) can stop
 * propagation to opt out of dragging.
 */
export function DraggableCard({
  x,
  y,
  children,
  className,
  label,
}: DraggableCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const [z, setZ] = useState(1);
  const [dragging, setDragging] = useState(false);
  const origin = useRef({ px: 0, py: 0, x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      const el = ref.current;
      const parent = el?.offsetParent as HTMLElement | null;
      if (!el || !parent) return;
      e.preventDefault();

      setZ(++zCounter);
      setDragging(true);
      origin.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };

      const maxX = parent.clientWidth - el.offsetWidth;
      const maxY = parent.clientHeight - el.offsetHeight;
      const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max));

      const move = (ev: PointerEvent) => {
        setPos({
          x: clamp(origin.current.x + (ev.clientX - origin.current.px), maxX),
          y: clamp(origin.current.y + (ev.clientY - origin.current.py), maxY),
        });
      };
      const up = () => {
        setDragging(false);
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    },
    [pos.x, pos.y],
  );

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      className={cn(
        "group absolute touch-none rounded-xl border border-border bg-surface/95 backdrop-blur",
        dragging ? "cursor-grabbing" : "cursor-grab",
        className,
      )}
      style={{
        left: pos.x,
        top: pos.y,
        zIndex: dragging ? 1000 : z,
        boxShadow: dragging
          ? "0 24px 50px -20px rgba(0,0,0,0.5), 0 0 0 1px var(--accent)"
          : "0 8px 24px -16px rgba(0,0,0,0.5)",
        transition: dragging ? "box-shadow 0.15s" : "box-shadow 0.25s",
      }}
    >
      {label && (
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
            {label}
          </span>
          <span className="flex gap-0.5 opacity-40 transition-opacity group-hover:opacity-100">
            <span className="h-1 w-1 rounded-full bg-fg-subtle" />
            <span className="h-1 w-1 rounded-full bg-fg-subtle" />
            <span className="h-1 w-1 rounded-full bg-fg-subtle" />
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
