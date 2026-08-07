"use client";

import { useState } from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  /** Text placed on the clipboard when clicked. */
  value: string;
  className?: string;
  /** Show a "Copy" / "Copied" text label next to the icon. */
  label?: boolean;
  size?: number;
}

/**
 * Copies `value` to the clipboard and briefly swaps its icon to a check with a
 * small bounce. Clipboard access can be blocked in sandboxed frames, so it
 * fails silently and still shows the confirmation.
 */
export function CopyButton({
  value,
  className,
  label = false,
  size = 15,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* clipboard unavailable — still confirm visually */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={copied ? "Copied" : "Copy"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-fg-muted transition-colors duration-150 hover:bg-elevated hover:text-fg",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex transition-transform duration-150",
          copied && "scale-110 text-success",
        )}
      >
        {copied ? <CheckIcon size={size} /> : <CopyIcon size={size} />}
      </span>
      {label && (
        <span className="text-xs font-medium">
          {copied ? "Copied" : "Copy"}
        </span>
      )}
    </button>
  );
}
