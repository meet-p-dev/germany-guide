"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import {
  Button,
  JargonGloss,
  ProgressBar,
  StepCard,
  LockedListItem,
} from "@/components/ds";

/* Local preview route for the design system (Increment 0). Not linked in nav,
   not in the sitemap. Renders every shared component in every state, in light
   and dark, so we can judge the system before building real screens. */

const SWATCHES: { name: string; cls: string; light: string; dark: string }[] = [
  { name: "surface", cls: "bg-gg-surface", light: "#F5F7FB", dark: "#0E1421" },
  { name: "card", cls: "bg-gg-card", light: "#FFFFFF", dark: "#161F30" },
  { name: "ink", cls: "bg-gg-ink", light: "#171E2E", dark: "#E7ECF5" },
  { name: "muted", cls: "bg-gg-muted", light: "#586074", dark: "#95A1B6" },
  { name: "border", cls: "bg-gg-border", light: "#E3E8F0", dark: "#28324A" },
  { name: "brand", cls: "bg-gg-brand", light: "#2547CC", dark: "#3D62F0" },
  { name: "brand-soft", cls: "bg-gg-brand-soft", light: "#E9EEFC", dark: "#1B2540" },
  { name: "progress", cls: "bg-gg-progress", light: "#128A50", dark: "#34C27E" },
  { name: "amber-ui", cls: "bg-gg-amber-ui", light: "#B7791F", dark: "#E8B44D" },
  { name: "teal", cls: "bg-gg-teal", light: "#0B7A73", dark: "#25B5AC" },
];

const TYPE_SCALE: { cls: string; label: string; px: string }[] = [
  { cls: "gg-display", label: "Display", px: "40 / display" },
  { cls: "gg-h1", label: "Heading 1", px: "32 / display" },
  { cls: "gg-h2", label: "Heading 2", px: "26 / display" },
  { cls: "gg-h3", label: "Heading 3", px: "21 / display" },
  { cls: "gg-body-lg", label: "Body large", px: "18 / body" },
  { cls: "gg-body", label: "Body", px: "16 / body" },
  { cls: "gg-body-sm", label: "Body small", px: "14 / body" },
  { cls: "gg-caption", label: "Caption", px: "13 / body" },
];

const SPACING = [
  ["1", 4],
  ["2", 8],
  ["3", 12],
  ["4", 16],
  ["5", 20],
  ["6", 24],
  ["8", 32],
  ["10", 40],
  ["12", 48],
  ["16", 64],
] as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <h2 className="gg-h2 mb-1 text-gg-ink">{title}</h2>
      <div className="mb-5 h-px w-full bg-gg-border" />
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);

  return (
    <div className="-mx-4 -my-8 min-h-screen bg-gg-surface px-6 py-10 font-sans text-gg-ink">
      <div className="mx-auto max-w-4xl">
        {/* Header + mode toggle */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="gg-display text-gg-ink">Design system</h1>
            <p className="gg-body-lg mt-2 max-w-xl text-gg-muted">
              Increment 0 — tokens, type scale, and the shared components every
              later screen inherits. Calm, ordered, one primary action at a time.
            </p>
          </div>
          <button
            onClick={() => setDark((d) => !d)}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[10px] border border-gg-border bg-gg-card px-4 text-sm font-medium text-gg-ink hover:brightness-[0.97]"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {dark ? "Light" : "Dark"}
          </button>
        </div>

        {/* Color tokens */}
        <Section title="Color tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {SWATCHES.map((s) => (
              <div
                key={s.name}
                className="overflow-hidden rounded-[10px] border border-gg-border bg-gg-card"
              >
                <div className={`h-14 w-full ${s.cls}`} />
                <div className="px-2.5 py-2">
                  <div className="gg-caption font-semibold text-gg-ink">
                    {s.name}
                  </div>
                  <div className="gg-caption text-gg-muted">
                    {dark ? s.dark : s.light}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Type scale */}
        <Section title="Type scale — Cabinet Grotesk display · DM Sans body">
          <div className="space-y-4 rounded-[14px] border border-gg-border bg-gg-card p-6">
            {TYPE_SCALE.map((t) => (
              <div key={t.cls} className="flex items-baseline gap-4">
                <span className="gg-caption w-24 shrink-0 text-gg-muted">
                  {t.px}
                </span>
                <span className={`${t.cls} text-gg-ink`}>
                  {t.label} — Anmeldung in Berlin
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* Spacing */}
        <Section title="Spacing scale — 4px base">
          <div className="space-y-2 rounded-[14px] border border-gg-border bg-gg-card p-6">
            {SPACING.map(([step, px]) => (
              <div key={step} className="flex items-center gap-4">
                <span className="gg-caption w-16 shrink-0 text-gg-muted">
                  {step} · {px}px
                </span>
                <span
                  className="h-3 rounded bg-gg-brand"
                  style={{ width: px }}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons — one primary, everything else quieter">
          <div className="flex flex-wrap items-center gap-4 rounded-[14px] border border-gg-border bg-gg-card p-6">
            <Button variant="primary">Show me how</Button>
            <Button variant="secondary">Not now</Button>
            <Button variant="primary" size="sm">
              Primary small
            </Button>
            <Button variant="secondary" size="sm">
              Secondary small
            </Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
          <p className="gg-body-sm mt-3 text-gg-muted">
            Only the Guide-Blue button reads as “the thing to do next”. Squint
            test: exactly one action dominates.
          </p>
        </Section>

        {/* Jargon gloss */}
        <Section title="Jargon gloss — inline, every time">
          <div className="space-y-4 rounded-[14px] border border-gg-border bg-gg-card p-6">
            <p className="gg-body-lg text-gg-ink">
              Your next step is{" "}
              <JargonGloss term="Anmeldung" gloss="register your address" />, and
              you must do it within 14 days of moving in.
            </p>
            <h3 className="gg-h3 text-gg-ink">
              <JargonGloss term="Anmeldung" gloss="register your address" />
            </h3>
          </div>
        </Section>

        {/* Progress bar */}
        <Section title="Progress bar — segmented, so the journey feels finite">
          <div className="space-y-6 rounded-[14px] border border-gg-border bg-gg-card p-6">
            <ProgressBar stage={1} total={6} percent={0} />
            <ProgressBar stage={3} total={6} percent={33} />
            <ProgressBar stage={6} total={6} percent={92} />
            <div className="pt-2">
              <p className="gg-body-sm mb-2 text-gg-muted">
                Continuous variant (within a single stage):
              </p>
              <ProgressBar
                stage={3}
                total={6}
                percent={60}
                variant="continuous"
                showLabel={false}
              />
            </div>
          </div>
        </Section>

        {/* Step card states */}
        <Section title="Step card — current / completed / locked, side by side">
          <div className="space-y-4">
            {/* Current: full width — the one dominant "now" card */}
            <StepCard
              state="current"
              index={2}
              title="Anmeldung"
              gloss="register your address"
              why="Almost everything else — bank account, tax ID, contracts — needs this first."
              deadline="Within 14 days"
              wait="~2 wk for a slot"
              docs="3 documents"
              secondaryLabel="Not now"
            />
            {/* Completed + locked: quieter, side by side beneath the current step */}
            <div className="grid gap-4 sm:grid-cols-2">
              <StepCard
                state="completed"
                index={1}
                title="Find a flat"
                gloss="somewhere to live"
              />
              <StepCard
                state="locked"
                index={3}
                title="Bank account"
                gloss="open a Girokonto"
              />
            </div>
          </div>
          <p className="gg-body-sm mt-3 text-gg-muted">
            Exactly one card is “now”. Completed folds to a quiet green row;
            locked recedes and can’t be tapped.
          </p>
        </Section>

        {/* Locked list */}
        <Section title="Dimmed / locked list items — future steps, visible but receded">
          <div className="space-y-2">
            <LockedListItem
              label="Register with a Krankenkasse"
              sublabel="public health insurance"
            />
            <LockedListItem
              label="Convert your driving licence"
              sublabel="Führerscheinumschreibung"
            />
            <LockedListItem label="File your first tax return" />
          </div>
        </Section>

        <div className="mt-16 border-t border-gg-border pt-6">
          <p className="gg-caption text-gg-muted">
            Increment 0 · germanyguide.net design system · every pair WCAG-AA
            verified in light and dark.
          </p>
        </div>
      </div>
    </div>
  );
}
