import type { Metadata } from "next";
import { Suspense } from "react";
import { getCities, getPhasesWithSteps } from "@/lib/content";
import { PlanWizard } from "@/components/plan/plan-wizard";

export const metadata: Metadata = {
  title: "Build my plan",
  description:
    "Answer up to three quick questions and get a personalised, city-aware roadmap for your move to Germany.",
};

export const revalidate = 3600;

export default async function PlanPage() {
  const [cities, phases] = await Promise.all([
    getCities(),
    getPhasesWithSteps(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Suspense>
        <PlanWizard cities={cities} phases={phases} />
      </Suspense>
    </div>
  );
}
