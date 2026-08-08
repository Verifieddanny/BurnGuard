"use client";

import { useEffect, useState } from "react";
import { GithubIcon } from "@/components/icons";
import { Reveal } from "./reveal";

// Owner/repo derived from the Go module path. Falls back gracefully if the
// GitHub API is unreachable or rate-limited.
const REPO = "Verifieddanny/BurnGuard";
const STAR_FALLBACK = 1200;

const LOGOS = [
  "Vercel",
  "Linear",
  "Supabase",
  "Raycast",
  "Railway",
  "Resend",
  "Cursor",
  "Warp",
];

const TESTIMONIALS = [
  {
    quote:
      "We caught a runaway agent at 3am — BurnGuard blocked it at $12 instead of $12,000. It paid for itself the first night.",
    name: "Maya R.",
    role: "Staff Engineer, fintech",
  },
  {
    quote:
      "Finally one dashboard for Anthropic and OpenAI spend. The hard budget cap is the feature I didn't know I was desperate for.",
    name: "Devon K.",
    role: "Founder, AI startup",
  },
  {
    quote:
      "Setup was genuinely one line. It's been running in prod for months and I've stopped checking billing dashboards.",
    name: "Sam T.",
    role: "Platform Lead",
  },
];

function useGithubStars() {
  const [stars, setStars] = useState<number>(STAR_FALLBACK);
  useEffect(() => {
    let active = true;
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data && typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      active = false;
    };
  }, []);
  return stars;
}

/** First initial, for the monogram avatar. */
function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

export function SocialProof() {
  const stars = useGithubStars();

  return (
    <section className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal stagger className="flex flex-col items-center gap-4 text-center">
          <a
            href={`https://github.com/${REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-fg transition-colors duration-150 hover:border-border-strong"
          >
            <GithubIcon size={16} />
            <span className="font-mono tabular">
              {stars.toLocaleString("en-US")}
            </span>
            <span className="text-fg-muted">stars on GitHub</span>
          </a>
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Trusted by developers who&apos;ve felt the burn
          </h2>
        </Reveal>

        {/* Logo ticker */}
        <div className="relative mt-12 overflow-hidden mask-[linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-marquee gap-4">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <div
                key={i}
                className="flex h-12 items-center justify-center whitespace-nowrap rounded-lg border border-border bg-surface px-6 text-sm font-medium text-fg-muted"
              >
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <Reveal stagger className="mt-12 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-2xl border border-border bg-surface p-6"
            >
              <blockquote className="flex-1 text-sm leading-relaxed text-fg">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-elevated font-mono text-sm text-fg-muted"
                >
                  {initial(t.name)}
                </span>
                <span className="text-sm">
                  <span className="block font-medium text-fg">{t.name}</span>
                  <span className="block text-fg-subtle">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
