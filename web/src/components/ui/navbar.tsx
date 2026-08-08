"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { Button } from "./button";
import { ThemeToggle } from "./theme-toggle";
import {
  CloseIcon,
  ExternalLinkIcon,
  GithubIcon,
  MenuIcon,
} from "@/components/icons";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Docs", href: "https://mintlify.wiki/Verifieddanny/BurnGuard/status", external: true },
];

const GITHUB_URL = "https://github.com/Verifieddanny/BurnGuard";

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Transparent over the hero, glassy/solid once scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile overlay is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Staggered entrance for the mobile overlay links.
  useGSAP(
    () => {
      if (!menuOpen || prefersReducedMotion() || !overlayRef.current) return;
      gsap.from(overlayRef.current.querySelectorAll("[data-menu-item]"), {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: "power2.out",
        stagger: 0.06,
      });
    },
    { dependencies: [menuOpen], scope: overlayRef },
  );

  const authHref = isAuthenticated ? "/dashboard" : "/login";
  const authLabel = isAuthenticated ? "Dashboard" : "Login";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
        <nav
          className={cn(
            "flex w-full max-w-4xl items-center gap-2 rounded-full border px-3 py-2 transition-all duration-300",
            scrolled
              ? "border-border bg-bg/70 shadow-lg backdrop-blur-xl"
              : "border-transparent bg-transparent",
          )}
          style={
            scrolled
              ? { boxShadow: "0 0 0 1px var(--border), 0 8px 40px -12px rgba(0,0,0,0.5)" }
              : undefined
          }
        >
          <Logo />

          <div className="mx-auto hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                className="rounded-full px-3 py-1.5 text-sm text-fg-muted transition-colors duration-150 hover:bg-elevated hover:text-fg"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-fg-muted transition-colors duration-150 hover:bg-elevated hover:text-fg"
            >
              GitHub
              <ExternalLinkIcon size={13} />
            </a>
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Button href={authHref} variant="ghost" size="sm">
              {authLabel}
            </Button>
            <Button href="/login" size="sm">
              Protect Your Wallet
            </Button>
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-fg md:hidden"
          >
            <MenuIcon size={20} />
          </button>
        </nav>
      </header>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-70 flex flex-col bg-bg/95 backdrop-blur-xl md:hidden"
        >
          <div className="flex items-center justify-between px-6 pt-6">
            <Logo />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-fg"
            >
              <CloseIcon size={20} />
            </button>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-2 px-6">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                data-menu-item
                onClick={() => setMenuOpen(false)}
                className="border-b border-border py-4 text-2xl font-semibold text-fg"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-menu-item
              className="flex items-center gap-2 border-b border-border py-4 text-2xl font-semibold text-fg"
            >
              <GithubIcon size={22} /> GitHub
            </a>
          </div>

          <div className="flex flex-col gap-3 px-6 pb-10">
            <div data-menu-item className="flex items-center justify-between">
              <span className="text-sm text-fg-muted">Theme</span>
              <ThemeToggle />
            </div>
            <Button
              href={authHref}
              variant="secondary"
              size="lg"
              data-menu-item
              onClick={() => setMenuOpen(false)}
            >
              {authLabel}
            </Button>
            <Button
              href="/login"
              size="lg"
              data-menu-item
              onClick={() => setMenuOpen(false)}
            >
              Protect Your Wallet
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
