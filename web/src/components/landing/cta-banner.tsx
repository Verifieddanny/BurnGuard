import { ArrowRightIcon } from "@/components/icons";
import { Reveal } from "./reveal";

export function CtaBanner() {
  return (
    <section className="px-6 py-28">
      <Reveal className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 overflow-hidden rounded-[2rem] bg-accent px-8 py-20 text-center">
        <h2 className="max-w-2xl font-display text-4xl font-semibold tracking-[-0.02em] text-accent-ink sm:text-5xl">
          Stop checking your billing dashboard every morning.
        </h2>
        <p className="max-w-lg text-lg text-accent-ink/80">
          Set a budget once. Let BurnGuard hold the line while you ship.
        </p>
        <a
          href="/login"
          className="mt-2 inline-flex h-14 items-center gap-2 rounded-xl bg-accent-ink px-7 text-base font-semibold text-accent transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          Protect Your Wallet
          <ArrowRightIcon size={18} />
        </a>
      </Reveal>
    </section>
  );
}
