import Link from "next/link";
import { ShieldIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

interface LogoProps {
  /** Render as a link to this href (defaults to "/"). Pass null for plain mark. */
  href?: string | null;
  /** Hide the "BurnGuard" wordmark, showing only the shield. */
  markOnly?: boolean;
  className?: string;
}

/** BurnGuard brand lockup: accent shield + wordmark. */
export function Logo({ href = "/", markOnly = false, className }: LogoProps) {
  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <ShieldIcon size={22} className="text-accent" strokeWidth={1.75} />
      {!markOnly && (
        <span className="text-lg font-semibold tracking-tight text-fg">
          Burn<span className="text-accent">Guard</span>
        </span>
      )}
    </span>
  );

  if (href === null) return content;
  return (
    <Link
      href={href}
      className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {content}
    </Link>
  );
}
