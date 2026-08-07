import { cn } from "@/lib/utils";
import type { IconProps } from "./base-icon";

/**
 * Anthropic provider mark (simplified placeholder). Defaults to currentColor;
 * pass a `fill` or `color` to brand it.
 */
export function AnthropicIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M14.6 4h-2.9l5.2 16h3.1L14.6 4zM8.4 4L2.9 20h3.2l1.1-3.2h5.3l1.1 3.2h.2L8.6 4h-.2zm-.2 9.9l1.7-5 1.7 5H8.2z" />
    </svg>
  );
}
