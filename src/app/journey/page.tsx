import type { Metadata } from "next";
import { getCities, getPhasesWithSteps } from "@/lib/content";
import { JourneyBoard } from "@/components/journey/journey-board";

export const metadata: Metadata = {
  title: "My journey",
  description:
    "Your personalised, phase-by-phase checklist for moving to Germany — adapted to your situation and your city.",
};

export const revalidate = 3600;

export default async function JourneyPage() {
  const [phases, cities] = await Promise.all([
    getPhasesWithSteps(),
    getCities(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <JourneyBoard phases={phases} cities={cities} />
    </div>
  );
}
