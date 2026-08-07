import { cn } from "@/lib/utils";
import type { IconProps } from "./base-icon";

/**
 * OpenAI provider mark (simplified placeholder). Defaults to currentColor;
 * pass a `stroke` or `color` to brand it.
 */
export function OpenAIIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3l7.5 4.3v8.4L12 20l-7.5-4.3V7.3L12 3z" />
      <path d="M12 3v8.5M12 12v8M19.5 7.5L12 12M4.5 7.5L12 12" />
    </svg>
  );
}
