import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { ShieldIcon, LightningIcon, ChartLineIcon } from "@/components/icons";
import { Reveal } from "./reveal";
import { StyledImage } from "../ui/styled-image";

const STEPS = [
  {
    n: "01",
    title: "Point your SDK at BurnGuard",
    body: "Change one line — your base URL. BurnGuard runs as a local proxy, so your keys never leave your machine.",
    icon: LightningIcon,
    detail: "base_url = http://localhost:4000",
  },
  {
    n: "02",
    title: "Every request is metered live",
    body: "Tokens and cost are computed per request across Anthropic, OpenAI, and Google — streamed to your dashboard in real-time.",
    icon: ChartLineIcon,
    detail: "SSE-safe · sub-millisecond overhead",
  },
  {
    n: "03",
    title: "Over budget? Blocked instantly",
    body: "Set a monthly cap. The moment a request would cross it, BurnGuard rejects it and pings you — before you're charged.",
    icon: ShieldIcon,
    detail: "429 budget_exceeded",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal stagger className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-sm text-accent">02 / setup</span>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.02em] text-fg sm:text-5xl">
            Three lines between you and a five-figure mistake.
          </h2>
          <p className="mt-5 text-lg text-fg-muted">
            No SDK rewrite. No vendor lock-in. It&apos;s a proxy — it just
            watches the money.
          </p>
        </Reveal>

        <Reveal className="mt-12">
          <StyledImage 
            width={1400}
            height={500}
            src="/img/how-it-works-view.png"
            alt="Wide banner (Ember, Mode A): three connected stages — (1) code editor with one highlighted line, (2) glowing ember-orange BurnGuard proxy node in the middle, (3) abstract API provider chips. Smooth connection lines with a few data pulses; warm espresso backdrop, no grid, no particles."
            fallbackDescription="Wide banner (Ember, Mode A): three connected stages — (1) code editor with one highlighted line, (2) glowing ember-orange BurnGuard proxy node in the middle, (3) abstract API provider chips. Smooth connection lines with a few data pulses; warm espresso backdrop, no grid, no particles."
            containerClassName="rounded-2xl border border-border bg-surface"
            className="rounded-2xl border border-border bg-surface md:object-[center_-80px] object-[center_-35px]"
          />
        </Reveal>

        <Reveal
          stagger
          className="mt-8 grid gap-4 md:grid-cols-3"
        >
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                className="group relative rounded-2xl border border-border bg-surface p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent/40"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-elevated text-accent transition-colors duration-200 group-hover:border-accent/40"
                  >
                    <Icon size={20} />
                  </span>
                  <span className="font-mono text-sm text-fg-subtle">
                    {step.n}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-fg">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-fg-muted">{step.body}</p>
                <p className="mt-4 rounded-md border border-border bg-bg px-3 py-2 font-mono text-xs text-fg-subtle">
                  {step.detail}
                </p>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
