"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface StyledImageProps extends Omit<ImageProps, "width" | "height" | "alt"> {
  /** Intended asset width in px. */
  width: number;
  /** Intended asset height in px. */
  height: number;
  /** Image source URL. */
  src: string;
  /** Accessibility description of the image. */
  alt: string;
  /** Optional fallback description shown if the image fails to load. */
  fallbackDescription?: string;
  containerClassName?: string;
}

/**
 * A styled image component built on next/image that matches the shape, aspect ratio,
 * and design system tokens of <ImagePlaceholder /> with loading and error states.
 */
export function StyledImage({
  width,
  height,
  src,
  alt,
  fallbackDescription,
  className,
  containerClassName,
  onLoad,
  onError,
  ...props
}: StyledImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Revert gracefully to placeholder aesthetic on load failure
  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        style={{ aspectRatio: `${width} / ${height}` }}
        className={cn(
          "relative flex w-full items-center justify-center overflow-hidden rounded-2xl",
          "border border-border bg-surface",
          containerClassName,
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-1 w-16 rounded-br-lg bg-accent"
        />
        <div className="relative flex max-w-xs flex-col items-center gap-2 p-6 text-center">
          <span className="rounded-full border border-border bg-bg/60 px-2.5 py-0.5 font-mono text-xs text-fg-subtle backdrop-blur">
            Failed to load
          </span>
          <p className="text-sm text-fg-muted">
            {fallbackDescription || alt}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ aspectRatio: `${width} / ${height}` }}
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border bg-surface",
        containerClassName,
      )}
    >
      {/* Skeleton loader background while image is fetching */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-bg/50" />
      )}

      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={(e) => {
          setIsLoaded(true);
          onLoad?.(e);
        }}
        onError={(e) => {
          setHasError(true);
          onError?.(e);
        }}
        loading="eager"
        className={cn(
          "h-full w-full object-cover transition-all duration-300 ease-in-out",
          !isLoaded ? "scale-105 blur-sm opacity-0" : "scale-100 blur-0 opacity-100",
          className,
        )}
        {...props}
      />
    </div>
  );
}
