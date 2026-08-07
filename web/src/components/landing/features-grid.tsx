import {
  ChartLineIcon,
  ShieldIcon,
  LightningIcon,
  BellIcon,
  KeyIcon,
  ArrowUpRightIcon,
} from "@/components/icons";
import {
  AnthropicIcon,
  OpenAIIcon,
  GoogleIcon,
} from "@/components/icons";
import { Reveal } from "./reveal";
import type { IconProps } from "@/components/icons";
import Image from "next/image";

interface Feature {
  title: string;
  body: string;
  icon: React.ReactNode | ((props: IconProps) => React.ReactNode);
}

const FEATURES: Feature[] = [
  {
    title: "Real-time cost tracking",
    body: "Every request priced the instant it completes. Watch spend move as it happens, not at month-end.",
    // icon: ChartLineIcon,
    icon: (<Image src="/img/real-time-tracking.png" alt="Chart Line" width={32} height={32} />)
  },
  {
    title: "Hard budget enforcement",
    body: "Set a cap and mean it. Requests over budget are rejected at the proxy — the charge never lands.",
    // icon: ShieldIcon,
    icon: (<Image src="/img/budget-enforcement.png" alt="Chart Line" width={32} height={32} />)

  },
  {
    title: "Multi-provider, one view",
    body: "Anthropic, OpenAI, and Google spend unified in a single dashboard with per-model breakdowns.",
    // icon: LightningIcon,
    icon: (<Image src="/img/multi-provider.png" alt="Chart Line" width={32} height={32} />)

  },
  {
    title: "SSE streaming, untouched",
    body: "Streaming responses pass straight through with usage captured on the fly. No buffering, no lag.",
    // icon: ArrowUpRightIcon,
    icon: (<Image src="/img/sse-streaming.png" alt="Chart Line" width={32} height={32} />)

  },
  {
    title: "Alerts before it hurts",
    body: "Slack and Discord webhooks fire at 50%, 80%, and 100% of budget so nothing sneaks up on you.",
    // icon: BellIcon,
    icon: (<Image src="/img/alerts.png" alt="Chart Line" width={32} height={32} />)
  },
  {
    title: "Keys never leave your box",
    body: "The proxy runs locally. Your provider keys stay on your machine — BurnGuard only sees the meter.",
    icon: KeyIcon,
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal stagger className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-sm text-accent">03 / arsenal</span>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-fg sm:text-5xl">
            Everything you need to sleep at night.
          </h2>
          <p className="mt-5 text-lg text-fg-muted">
            A firewall for your API spend — with the visibility to back it up.
          </p>
        </Reveal>

        <Reveal stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const iconNode =
              typeof f.icon === "function"
                ? (f.icon as (props: IconProps) => React.ReactNode)({ size: 28 })
                : f.icon;

            return (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1"
                style={{ willChange: "transform" }}
              >
                {/* Hover border glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1px var(--accent), 0 0 40px -12px var(--accent)",
                  }}
                />
                {/* Mini illustration: duotone glyph in a glowing accent tile */}
                <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-elevated text-accent transition-transform duration-200 group-hover:scale-105">
                  {iconNode}
                </div>
                <h3 className="relative mt-5 text-lg font-semibold text-fg">
                  {f.title}
                </h3>
                <p className="relative mt-2 text-sm text-fg-muted">{f.body}</p>
              </div>
            );
          })}
        </Reveal>

        {/* Supported providers strip */}
        <Reveal className="mt-10 flex items-center justify-center gap-8 text-fg-subtle">
          <span className="text-xs uppercase tracking-widest">Works with</span>
          <AnthropicIcon size={22} />
          <OpenAIIcon size={22} />
          <GoogleIcon size={22} />
        </Reveal>
      </div>
    </section>
  );
}
