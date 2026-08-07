"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import {
  ChartLineIcon,
  KeyIcon,
  SettingsIcon,
  type IconProps,
} from "@/components/icons";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; icon: (p: IconProps) => React.ReactNode }[] =
  [
    { href: "/dashboard", label: "Overview", icon: ChartLineIcon },
    { href: "/dashboard/tokens", label: "Tokens", icon: KeyIcon },
    { href: "/dashboard/settings", label: "Settings", icon: SettingsIcon },
  ];

/**
 * Collapsed icon rail that expands to a labelled panel on hover. It's fixed and
 * overlays content when expanded, so the main column never shifts.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="group fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-border bg-surface transition-[width] duration-200 hover:w-56">
      <div className="flex h-16 items-center px-4">
        <Logo href="/dashboard" markOnly className="group-hover:hidden" />
        <Logo href="/dashboard" className="hidden group-hover:inline-flex" />
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-accent/12 text-accent"
                  : "text-fg-muted hover:bg-elevated hover:text-fg",
              )}
            >
              <Icon size={20} className="shrink-0" />
              <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
