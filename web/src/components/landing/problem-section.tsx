import { Badge } from "@/components/ui/badge";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { CountUp } from "./count-up";
import { Reveal } from "./reveal";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { StyledImage } from "../ui/styled-image";

const STATS = [
  { label: "Runaway loop, one weekend", value: 30141, prefix: "$" },
  { label: "Requests before anyone noticed", value: 2_400_000 },
  { label: "Refund from the provider", value: 0, prefix: "$" },
];

export function ProblemSection() {
  return (
    <section className="relative overflow-hidden bg-surface px-6 py-28">
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal stagger className="flex flex-col items-start gap-6">
          <Badge tone="danger">The horror story</Badge>
          <h2 className="max-w-md text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            A developer left a loop running. The bill hit{" "}
            <CountUp
              value={30141}
              prefix="$"
              className="text-danger"
              duration={2.4}
            />
            .
          </h2>
          <p className="max-w-md text-lg text-fg-muted">
            No cap. No alert. No kill switch. By the time the invoice email
            arrived, the damage was done — and the provider doesn&apos;t issue
            refunds for &ldquo;working as intended.&rdquo; This happens every
            week, to careful engineers.
          </p>

          <dl className="mt-2 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <dd className="font-mono text-2xl font-semibold text-danger">
                  <CountUp
                    value={s.value}
                    prefix={s.prefix ?? ""}
                    duration={2}
                  />
                </dd>
                <dt className="mt-1 text-xs text-fg-subtle">{s.label}</dt>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal>
          <StyledImage
            width={800}
            height={600}
            src="/img/problem.png"
            alt="Ember, Mode A: stylized billing invoice out of control with an alarmingly large total ($30,141) in monospace, a cost line shooting vertically off the top, heat ramp from ember orange into alarm red (#E5484D), optional hairline cracks. Warm espresso backdrop, minimal."
            fallbackDescription="Stylized billing invoice out of control with an alarmingly large total ($30,141) in monospace, a cost line shooting vertically off the top, heat ramp from ember orange into alarm red (#E5484D), optional hairline cracks. Warm espresso backdrop, minimal."
            className="rounded-2xl border border-border bg-surface"
            containerClassName="rounded-2xl border border-border bg-surface"
          />
        </Reveal>
      </div>
    </section>
  );
}
