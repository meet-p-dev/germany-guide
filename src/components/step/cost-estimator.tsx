"use client";

import { useState } from "react";
import { Briefcase, Calculator, GraduationCap } from "lucide-react";
import type { Persona } from "@/lib/content";
import { formatCost } from "@/lib/content";
import { useVisitorProfile } from "@/lib/profile-store";
import { cn } from "@/lib/utils";

export interface PersonaCostTotals {
  /** One-off official fees (visa, permits…), in cents. */
  oneOffCents: number;
  /** Recurring monthly costs from the guide (insurance, broadcast fee…), in cents. */
  monthlyCents: number;
  /** Money to show, not spend (blocked account), in cents. */
  proofCents: number;
}

/**
 * First-year estimator on the costs-of-living step: the official figures come
 * from the guide's own cost fields; the visitor only supplies the one number
 * we can't know — their rent.
 */
export function CostEstimator({
  totals,
}: {
  totals: Record<Persona, PersonaCostTotals>;
}) {
  const { ready, profile } = useVisitorProfile();
  const [chosen, setChosen] = useState<Persona | null>(null);
  const [rentEuros, setRentEuros] = useState(550);

  const persona: Persona =
    chosen ?? (ready && profile.persona ? profile.persona : "student");
  const t = totals[persona];

  const monthlyAll = t.monthlyCents + rentEuros * 100;
  const firstYear = t.oneOffCents + monthlyAll * 12;

  return (
    <section className="mt-10 rounded-3xl border border-border bg-card p-6">
      <p className="flex items-center gap-2 font-display text-xl font-bold">
        <Calculator className="h-5 w-5 text-gold" />
        Your first-year estimate
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Official fees and recurring costs come straight from this guide. Set
        your expected rent and see the whole year.
      </p>

      <div className="mt-5 flex gap-2">
        {(
          [
            { value: "student", icon: GraduationCap, label: "Student" },
            { value: "worker", icon: Briefcase, label: "Skilled worker" },
          ] as const
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setChosen(option.value)}
            aria-pressed={persona === option.value}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
              persona === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted hover:border-foreground/25 hover:text-foreground",
            )}
          >
            <option.icon className="h-4 w-4" />
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="rent-slider" className="font-medium">
            Monthly rent (incl. utilities)
          </label>
          <span className="font-display text-lg font-bold">€{rentEuros}</span>
        </div>
        <input
          id="rent-slider"
          type="range"
          min={250}
          max={1500}
          step={25}
          value={rentEuros}
          onChange={(event) => setRentEuros(Number(event.target.value))}
          className="mt-2 w-full accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-muted">
          <span>€250, shared room</span>
          <span>€1,500, own city flat</span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <EstimateTile
          value={formatCost(monthlyAll, "one_time") ?? "n/a"}
          label="per month, all in"
        />
        <EstimateTile
          value={formatCost(t.oneOffCents, "one_time") ?? "€0"}
          label="one-off official fees"
        />
        <EstimateTile
          value={formatCost(firstYear, "one_time") ?? "n/a"}
          label="first year, total"
          highlight
        />
      </div>

      {persona === "student" && t.proofCents > 0 && (
        <p className="mt-4 rounded-2xl bg-gold-soft/60 p-4 text-sm leading-relaxed">
          <span className="font-semibold">Plus the blocked account:</span>{" "}
          {formatCost(t.proofCents, "one_time")} shown as proof of funds. It
          stays your own money and pays you back monthly while you study.
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-muted">
        A planning estimate rather than a quote. Rents vary hugely by city.
      </p>
    </section>
  );
}

function EstimateTile({
  value,
  label,
  highlight = false,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-4",
        highlight
          ? "bg-primary text-primary-foreground"
          : "bg-card-muted/60",
      )}
    >
      <p className="font-display text-2xl font-bold">{value}</p>
      <p
        className={cn(
          "mt-1 text-sm leading-snug",
          highlight ? "text-primary-foreground/85" : "text-muted",
        )}
      >
        {label}
      </p>
    </div>
  );
}
