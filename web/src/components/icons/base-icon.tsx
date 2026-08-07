import { cn } from "@/lib/utils";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Pixel size for both width and height. Defaults to 24. */
  size?: number;
}

/**
 * BurnGuard's icon system: **solid duotone**. Each icon layers a low-opacity
 * filled silhouette (the {@link Solid} base) under crisp full-strength outlines.
 * The chunky, squared-cap strokes and filled bodies read as a deliberate custom
 * set — not a generic line-icon library.
 */
export function BaseIcon({
  size = 24,
  className,
  children,
  strokeWidth = 1.9,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Low-opacity filled silhouette that gives each icon its duotone body. */
export function Solid({ d, opacity = 0.2 }: { d: string; opacity?: number }) {
  return <path d={d} fill="currentColor" stroke="none" opacity={opacity} />;
}
