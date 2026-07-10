"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PERSONAS } from "@/lib/persona-copy";
import { PERSONA_UI, FALLBACK_PERSONA_ICON } from "@/lib/persona-ui";

export type WizardCity = { slug: string; name: string; state: string };

const CITY_GRADIENTS = [
  "from-primary/85 to-primary/50",
  "from-accent/80 to-accent/40",
  "from-primary/70 to-accent/50",
  "from-accent/70 to-primary/50",
  "from-primary/80 to-primary/40",
  "from-accent/75 to-accent/45",
];

const STEPS = ["Your situation", "Your city"] as const;

/**
 * Two-step "build my plan" wizard (Ankommen funnel): pick a situation
 * (persona) then a city, and land on the interactive /roadmap. Cities render
 * as on-brand gradient tiles (no photo column yet).
 */
export function JourneySetup({
  cities,
  initialCity,
}: {
  cities: WizardCity[];
  initialCity?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<0 | 1>(0);
  const [persona, setPersona] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(
    initialCity && cities.some((c) => c.slug === initialCity) ? initialCity : null
  );

  const finish = () => {
    if (!persona || !city) return;
    router.push(`/roadmap?persona=${persona}&city=${city}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
      <div className="mb-8 flex items-center gap-3">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <span
              className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold transition-colors ${
                step >= i
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {step > i ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span
              className={`text-sm font-semibold ${step >= i ? "" : "text-muted-foreground"}`}
            >
              {label}
            </span>
            {i === 0 && <span className="hidden h-px w-10 bg-border sm:block" />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Why are you coming to Germany?
          </h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;ll tailor every step to your situation.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PERSONAS.map((p) => {
              const Icon = PERSONA_UI[p.slug]?.icon ?? FALLBACK_PERSONA_ICON;
              const blurb = PERSONA_UI[p.slug]?.blurb ?? p.intro;
              const selected = persona === p.slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setPersona(p.slug)}
                  className={`group flex items-start gap-4 rounded-2xl border p-5 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/[0.06]"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-lg font-bold">{p.label}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {blurb}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex justify-end">
            <Button
              disabled={!persona}
              onClick={() => setStep(1)}
              className="gap-2 rounded-full font-semibold"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Which city are you moving to?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Rules differ by city — registration, offices and waiting times all
            change.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((c, i) => {
              const selected = city === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => setCity(c.slug)}
                  className={`group overflow-hidden rounded-2xl border text-left transition-colors ${
                    selected
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`relative flex h-24 items-end bg-gradient-to-br ${CITY_GRADIENTS[i % CITY_GRADIENTS.length]}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {selected && (
                      <span className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                    <span className="relative p-3 text-lg font-bold text-white">
                      {c.name}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-muted-foreground">{c.state}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep(0)}
              className="gap-2 rounded-full font-semibold"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              disabled={!city}
              onClick={finish}
              className="gap-2 rounded-full font-semibold"
            >
              See my roadmap <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
