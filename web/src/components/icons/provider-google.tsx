import { cn } from "@/lib/utils";
import type { IconProps } from "./base-icon";

/**
 * Google provider mark (simplified monochrome "G" placeholder). Defaults to
 * currentColor; pass a `stroke` or `color` to brand it.
 */
export function GoogleIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <path d="M20 12a8 8 0 1 1-2.34-5.66" />
      <path d="M12 12h8" />
    </svg>
  );
}
