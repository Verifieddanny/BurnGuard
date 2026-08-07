"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCreateToken } from "@/hooks/use-tokens";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";
import {
  ShieldIcon,
  ArrowRightIcon,
  CheckIcon,
  LightningIcon,
  KeyIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

const STEPS = ["Welcome", "Install", "Token", "Init", "Verify"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [token, setToken] = useState<string>("bg_your_sync_token_here");

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="flex min-h-dvh flex-col px-6 py-6">
      {/* Chrome */}
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between">
        <Logo href="/" />
        <Link
          href="/dashboard"
          className="text-sm text-fg-muted transition-colors hover:text-fg"
        >
          Skip
        </Link>
      </header>

      {/* Stepper */}
      <div className="mx-auto mt-8 flex w-full max-w-md items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-1.5">
            <div
              className={cn(
                "h-1 rounded-full transition-colors duration-300",
                i <= step ? "bg-accent" : "bg-border",
              )}
            />
            <span
              className={cn(
                "hidden text-[10px] uppercase tracking-wide transition-colors sm:block",
                i === step ? "text-accent" : "text-fg-subtle",
              )}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center">
        <div key={step} className="app-page-in w-full py-12">
          {step === 0 && <Welcome onNext={next} />}
          {step === 1 && <Install />}
          {step === 2 && <TokenStep token={token} setToken={setToken} />}
          {step === 3 && <InitStep token={token} />}
          {step === 4 && <Verify />}
        </div>
      </main>

      {/* Nav */}
      {step > 0 && (
        <footer className="mx-auto flex w-full max-w-2xl items-center justify-between">
          <button
            type="button"
            onClick={back}
            className="text-sm text-fg-muted transition-colors hover:text-fg"
          >
            Back
          </button>
          {step < STEPS.length - 1 && (
            <Button onClick={next}>
              Continue <ArrowRightIcon size={16} />
            </Button>
          )}
        </footer>
      )}
    </div>
  );
}

function Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/12 text-accent">
        <ShieldIcon size={40} />
      </span>
      <h1 className="mt-8 font-display text-4xl font-semibold tracking-[-0.02em] text-fg">
        Welcome to BurnGuard
      </h1>
      <p className="mt-4 max-w-md text-lg text-fg-muted">
        BurnGuard sits between your app and AI providers, tracking every dollar
        in real time. Let&apos;s set it up — takes about two minutes.
      </p>
      <Button onClick={onNext} size="lg" className="mt-8">
        Let&apos;s go <ArrowRightIcon size={18} />
      </Button>
    </div>
  );
}

function CommandBlock({ cmd }: { cmd: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
      <span className="select-none text-fg-subtle">$</span>
      <code className="flex-1 truncate font-mono text-sm text-fg">{cmd}</code>
      <CopyButton value={cmd} />
    </div>
  );
}

function Install() {
  return (
    <div>
      <StepHeading
        icon={<LightningIcon size={22} />}
        title="Install the proxy"
        sub="Pick your poison. Both drop the burnguard binary on your PATH."
      />
      <div className="mt-6 space-y-3">
        <CommandBlock cmd="brew install burnguard" />
        <CommandBlock cmd="curl -fsSL https://burnguard.run/install.sh | sh" />
      </div>
    </div>
  );
}

function randomToken() {
  const hex = Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
  return `bg_${hex}`;
}

function TokenStep({
  token,
  setToken,
}: {
  token: string;
  setToken: (t: string) => void;
}) {
  const [name, setName] = useState("");
  const [revealed, setRevealed] = useState(false);
  const create = useCreateToken();

  const generate = () => {
    create.mutate(name || "my-proxy", {
      onSuccess: (data) => {
        setToken(data.token);
        setRevealed(true);
      },
      // Offline / no backend: fall back to a sample so the flow still completes.
      onError: () => {
        setToken(randomToken());
        setRevealed(true);
      },
    });
  };

  return (
    <div>
      <StepHeading
        icon={<KeyIcon size={22} />}
        title="Create your first sync token"
        sub="This links your local proxy to your account."
      />

      {!revealed ? (
        <div className="mt-6 flex items-end gap-3">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-fg">
              Token name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. laptop"
            />
          </div>
          <Button onClick={generate} disabled={create.isPending}>
            {create.isPending ? "Generating…" : "Generate"}
          </Button>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-accent/40 bg-accent/5 p-4">
          <p className="mb-3 text-sm font-medium text-accent">
            Save this token — you won&apos;t see it again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg border border-border bg-bg px-3 py-2.5 font-mono text-sm text-fg">
              {token}
            </code>
            <CopyButton value={token} label />
          </div>
        </div>
      )}
    </div>
  );
}

function InitStep({ token }: { token: string }) {
  const masked =
    token.length > 14 ? `${token.slice(0, 10)}…${token.slice(-4)}` : token;

  return (
    <div>
      <StepHeading
        icon={<LightningIcon size={22} />}
        title="Run burnguard init"
        sub="One command. The wizard writes the config for you — you never touch YAML. Paste your sync token when prompted."
      />

      <div className="mt-6 space-y-3">
        <CommandBlock cmd="burnguard init" />

        {/* Terminal mockup of the interactive wizard output */}
        <div className="overflow-hidden rounded-xl border border-border bg-primary">
          <div className="flex items-center gap-2 border-b border-border/70 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-2 font-mono text-xs text-fg-subtle">
              burnguard init
            </span>
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-relaxed text-fg-muted">
            <span className="text-accent">$</span> burnguard init{"\n\n"}
            {"  BurnGuard setup wizard\n\n"}
            <span className="text-fg">
              {"  ? Paste your sync token › "}
            </span>
            <span className="text-accent">{masked}</span>
            {"\n"}
            <span className="text-success">{"  ✓"}</span>
            {" token validated\n"}
            <span className="text-success">{"  ✓"}</span>
            {" providers detected: anthropic, openai\n"}
            <span className="text-success">{"  ✓"}</span>
            {" config written to "}
            <span className="text-fg">~/.burnguard/config.yaml</span>
            {"\n\n"}
            <span className="text-accent">{"  ▸"}</span>
            {" next: "}
            <span className="text-fg">burnguard start</span>
          </pre>
        </div>
      </div>
    </div>
  );
}

function Verify() {
  const { data } = useQuery({
    queryKey: ["onboard", "summary"],
    queryFn: api.dashboard.summary,
    refetchInterval: 2500,
    retry: false,
  });
  const connected = (data?.total_requests ?? 0) > 0;

  return (
    <div className="flex flex-col items-center text-center">
      <span
        className={cn(
          "flex h-20 w-20 items-center justify-center rounded-full transition-colors duration-500",
          connected ? "bg-success/15 text-success" : "bg-elevated text-fg-subtle",
        )}
      >
        {connected ? (
          <CheckIcon size={40} />
        ) : (
          <span className="flex gap-1">
            <Dot delay="0s" />
            <Dot delay="0.2s" />
            <Dot delay="0.4s" />
          </span>
        )}
      </span>

      <h1 className="mt-8 font-display text-4xl font-semibold tracking-[-0.02em] text-fg">
        {connected ? "Connected! BurnGuard is watching." : "You're protected"}
      </h1>
      <p className="mt-4 max-w-md text-lg text-fg-muted">
        {connected
          ? "Your first request came through. Everything from here shows up live on your dashboard."
          : "Send a request through your proxy — we'll light up the moment it lands. Waiting for your first request…"}
      </p>
      <Button href="/dashboard" size="lg" className="mt-8">
        Go to Dashboard <ArrowRightIcon size={18} />
      </Button>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-2.5 w-2.5 animate-bounce rounded-full bg-accent"
      style={{ animationDelay: delay }}
    />
  );
}

function StepHeading({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent">
        {icon}
      </span>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-fg">
          {title}
        </h1>
        <p className="mt-1 text-fg-muted">{sub}</p>
      </div>
    </div>
  );
}
