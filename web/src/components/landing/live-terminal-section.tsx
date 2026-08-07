import { AppWindow } from "./app-window";
import { AnimatedTerminal } from "./animated-terminal";
import { Reveal } from "./reveal";

export function LiveTerminalSection() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_1.05fr]">
        <Reveal stagger className="flex flex-col items-start">
          <span className="font-mono text-sm text-accent">01 / live</span>
          <h2 className="mt-4 max-w-md text-4xl font-semibold leading-[1.05] tracking-[-0.02em] text-fg sm:text-5xl">
            Watch every request get priced in real time.
          </h2>
          <p className="mt-6 max-w-md text-lg text-fg-muted">
            Each call flows through the meter and lands on your dashboard the
            moment it completes. When the next request would cross your cap,
            BurnGuard rejects it — before the charge ever happens.
          </p>
        </Reveal>

        <Reveal className="flex justify-center lg:justify-end">
          <AppWindow title="burnguard — live">
            <AnimatedTerminal />
          </AppWindow>
        </Reveal>
      </div>
    </section>
  );
}
