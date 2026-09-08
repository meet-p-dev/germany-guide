import type { Metadata } from "next";
import { getPhasesWithSteps, type CostType } from "@/lib/content";
import { Kicker } from "@/components/ui/kicker";
import { CostExplorer, type CostItem } from "@/components/costs/cost-explorer";

const BASE_URL = "https://www.germanyguide.net";

export const metadata: Metadata = {
  title: "What Germany Costs in Your First Year",
  description:
    "Official fees, monthly living costs and the blocked account — a clear, personalised estimate of what your first year in Germany really costs, for students and workers.",
  alternates: { canonical: `${BASE_URL}/costs` },
};

export const revalidate = 3600;

export default async function CostsPage() {
  const phases = await getPhasesWithSteps();
  const items: CostItem[] = phases
    .flatMap((phase) => phase.steps)
    .filter((step) => step.cost_cents !== null || step.cost_type !== null)
    .map((step) => ({
      slug: step.slug,
      title: step.title,
      appliesTo: step.applies_to,
      costCents: step.cost_cents,
      costType: step.cost_type as CostType | null,
      costNote: step.cost_note,
      cityVariable: step.city_variable,
    }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Kicker>What it costs</Kicker>
      <h1 className="font-display mt-3 max-w-2xl text-4xl font-extrabold leading-[1.08] sm:text-5xl">
        What will your first year in Germany really cost?
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">
        Pick your path and set your rent — the official fees and recurring costs
        come straight from this guide, so you get a real number instead of a
        guess.
      </p>

      <div className="mt-10">
        <CostExplorer items={items} />
      </div>
    </div>
  );
}
