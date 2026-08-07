import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { GithubIcon, ExternalLinkIcon } from "@/components/icons";

const LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "/#" },
  { label: "Login", href: "/login" },
];

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="text-xs text-fg-subtle">
            © {new Date().getFullYear()} BurnGuard. Ship without the surprise.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm text-fg-muted transition-colors duration-150 hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors duration-150 hover:text-fg"
          >
            <GithubIcon size={15} />
            GitHub
            <ExternalLinkIcon size={12} />
          </a>
        </nav>
      </div>
    </footer>
  );
}
