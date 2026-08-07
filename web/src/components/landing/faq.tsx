"use client";

import { useState } from "react";
import { PlusIcon, CloseIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const ITEMS = [
  {
    q: "How does BurnGuard actually block a request?",
    a: "It runs as a local proxy. Before forwarding a call, it checks the projected cost against your budget. If the request would push you over, it never reaches the provider — you get a clean 429 back instead of a charge.",
  },
  {
    q: "Do my API keys leave my machine?",
    a: "No. The proxy runs locally and holds your provider keys. BurnGuard's cloud only ever receives usage metadata — tokens and cost — never your keys or prompt contents.",
  },
  {
    q: "Which providers are supported?",
    a: "Anthropic, OpenAI, and Google today, unified into one dashboard with per-model breakdowns. More providers are on the way.",
  },
  {
    q: "Does it add latency?",
    a: "Effectively none — the proxy adds sub-millisecond overhead and streams responses straight through, so SSE and token streaming behave exactly as before.",
  },
  {
    q: "How is cost calculated?",
    a: "Per request, from the provider's own token accounting and current model pricing — including cached and streamed tokens — so the number you see matches the invoice.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="px-6 py-28">
      <div className="mx-auto max-w-3xl">
        <Reveal className="mb-12 text-center">
          <h2 className="text-4xl font-semibold tracking-[-0.02em] text-fg sm:text-5xl">
            Questions, answered.
          </h2>
        </Reveal>

        <Reveal stagger className="divide-y divide-border border-y border-border">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-4 py-5 text-left"
                >
                  <span className="font-mono text-sm text-fg-subtle">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-lg font-medium text-fg">
                    {item.q}
                  </span>
                  <span className="shrink-0 text-fg-muted">
                    {isOpen ? <CloseIcon size={18} /> : <PlusIcon size={18} />}
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pl-10 pr-8 text-fg-muted">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
