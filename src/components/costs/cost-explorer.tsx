"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  PiggyBank,
  Receipt,
  RefreshCw,
} from "lucide-react";
import type { CostType, Persona } from "@/lib/content";
import { formatCost, isPayableFee } from "@/lib/content";
import { useVisitorProfile } from "@/lib/profile-store";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export interface CostItem {
  slug: string;
  title: string;
  appliesTo: string;
  costCents: number | null;
  costType: CostType | null;
  costNote: string | null;
  cityVariable: boolean;
}

function applies(item: CostItem, persona: Persona): boolean {
  return item.appliesTo === "both" || item.appliesTo === persona;
}

export function CostExplorer({ items }: { items: CostItem[] }) {
  const { ready, profile } = useVisitorProfile();
  const [chosen, setChosen] = useState<Persona | null>(null);
  const [rentEuros, setRentEuros] = useState(550);

  const persona: Persona =
    chosen ?? (ready && profile.persona ? profile.persona : "student");

  const mine = items.filter((item) => applies(item, persona));
  const oneOff = mine.filter(
    (item) => isPayableFee(item.costType) && item.costCents,
  );
  const monthly = mine.filter(
    (item) => item.costType === "monthly" && item.costCents,
  );
  const proof = mine.find((item) => item.costType === "proof_of_funds");

  const oneOffCents = oneOff.reduce((sum, i) => sum + (i.costCents ?? 0), 0);
  const monthlyGuideCents = monthly.reduce(
    (sum, i) => sum + (i.costCents ?? 0),
    0,
  );
  const monthlyAll = monthlyGuideCents + rentEuros * 100;
  const firstYear = oneOffCents + monthlyAll * 12;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
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
              "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all",
              persona === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted hover:border-foreground/25 hover:text-foreground",
            )}
          >
            <option.icon className="h-4 w-4" />
            {option.label}
          </button>
        ))}
      </div>

      {/* Rent — the one number we can't know for you. */}
      <div className="mt-8 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center justify-between text-sm">
          <label htmlFor="rent" className="font-medium">
            Your monthly rent (incl. utilities)
          </label>
          <span className="font-display text-xl font-bold">€{rentEuros}</span>
        </div>
        <input
          id="rent"
          type="range"
          min={250}
          max={1500}
          step={25}
          value={rentEuros}
          onChange={(event) => setRentEuros(Number(event.target.value))}
          className="mt-3 w-full accent-[var(--primary)]"
        />
        <div className="flex justify-between text-xs text-muted">
          <span>€250, shared room</span>
          <span>€1,500, own city flat</span>
        </div>
      </div>

      {/* Headline numbers. */}
      <motion.div
        key={`${persona}-${rentEuros}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="mt-5 grid gap-4 sm:grid-cols-3"
      >
        <Tile value={`${formatCost(monthlyAll, "one_time")}`} label="per month, all in" />
        <Tile
          value={formatCost(oneOffCents, "one_time") ?? "€0"}
          label="one-off official fees"
        />
        <Tile
          value={`${formatCost(firstYear, "one_time")}`}
          label="your first year, total"
          highlight
        />
      </motion.div>

      {persona === "student" && proof?.costCents && (
        <div className="mt-4 flex items-start gap-4 rounded-3xl border border-gold/40 bg-gold-soft/50 p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-card text-gold">
            <PiggyBank className="h-5 w-5" />
          </span>
          <div>
            <p className="font-display font-bold">
              Plus {formatCost(proof.costCents, "one_time")} in a blocked account
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Shown as proof of funds for your visa, but it is your own money
              to live on, released to you month by month once you arrive.
            </p>
            <Link
              href={`/guide/${proof.slug}`}
              className="group mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              How the blocked account works
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Itemised breakdown. */}
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <CostList
          icon={Receipt}
          title="One-off official fees"
          empty="No fixed fees on your path."
          items={oneOff}
          suffix=""
        />
        <CostList
          icon={RefreshCw}
          title="Every month"
          empty="Nothing recurring from the guide."
          items={monthly}
          suffix=" / mo"
        />
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted">
        A planning estimate, not a quote. Official fees come from this guide;
        rent and some monthly costs vary a lot by city and lifestyle. Every line
        links to the step where you can check the exact, locally-verified figure.
      </p>
    </div>
  );
}

function Tile({
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
        "rounded-3xl p-5",
        highlight ? "bg-primary text-primary-foreground" : "bg-card-muted/60",
      )}
    >
      <p className="font-display text-3xl font-bold">{value}</p>
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

function CostList({
  icon: Icon,
  title,
  empty,
  items,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  empty: string;
  items: CostItem[];
  suffix: string;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6">
      <p className="flex items-center gap-2 font-display text-lg font-bold">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </p>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <li key={item.slug} className="flex items-baseline justify-between gap-3 py-3">
              <Link
                href={`/guide/${item.slug}`}
                className="min-w-0 text-[15px] font-medium hover:text-primary hover:underline"
              >
                {item.title}
                {item.costNote && (
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {item.costNote}
                  </span>
                )}
              </Link>
              <span className="shrink-0 font-display font-bold">
                {formatCost(item.costCents, "one_time")}
                {suffix}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
