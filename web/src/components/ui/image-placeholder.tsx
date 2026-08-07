import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  /** Intended asset width in px (shown in the label). */
  width: number;
  /** Intended asset height in px (shown in the label). */
  height: number;
  /** What the final asset should depict — for a designer or AI image tool. */
  description: string;
  className?: string;
}

/**
 * A labeled placeholder for an image slot that has no asset yet. Renders a
 * bordered box that holds the target aspect ratio, states the exact intended
 * dimensions, and describes the asset — per the PRD's image guidelines. Swap
 * for a real <Image> once the asset exists.
 */
export function ImagePlaceholder({
  width,
  height,
  description,
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={description}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-2xl",
        "border border-border bg-surface",
        className,
      )}
    >
      {/* accent corner tab so the slot reads as an intentional design surface */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-1 w-16 rounded-br-lg bg-accent"
      />
      <div className="relative flex max-w-xs flex-col items-center gap-2 p-6 text-center">
        <span className="rounded-full border border-border bg-bg/60 px-2.5 py-0.5 font-mono text-xs text-fg-subtle backdrop-blur">
          {width}×{height}
        </span>
        <p className="text-sm text-fg-muted">{description}</p>
      </div>
    </div>
  );
}
