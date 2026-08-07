"use client";

import { useCallback, useRef, useState } from "react";

export interface Point {
  x: number;
  y: number;
}

/**
 * Pointer-based drag for a floating element. Attach {@link onPointerDown} to a
 * drag handle (e.g. a window title bar); the returned `pos` is the accumulated
 * translation to apply as `translate(x, y)`. Works for mouse, touch, and pen.
 */
export function useDraggable(initial: Point = { x: 0, y: 0 }) {
  const [pos, setPos] = useState<Point>(initial);
  const [dragging, setDragging] = useState(false);
  const origin = useRef({ px: 0, py: 0, x: 0, y: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      origin.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
      setDragging(true);

      const move = (ev: PointerEvent) => {
        setPos({
          x: origin.current.x + (ev.clientX - origin.current.px),
          y: origin.current.y + (ev.clientY - origin.current.py),
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

  const reset = useCallback(() => setPos(initial), [initial]);

  return { pos, dragging, onPointerDown, reset };
}
