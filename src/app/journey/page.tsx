import type { Metadata } from "next";
import { getCities, getPhasesWithSteps } from "@/lib/content";
import { JourneyBoard } from "@/components/journey/journey-board";
import {
  DeadlineClock,
  type DeadlineStep,
} from "@/components/journey/deadline-clock";

export const metadata: Metadata = {
  title: "My journey",
  description:
    "Your personalised, phase-by-phase checklist for moving to Germany, adapted to your situation and your city.",
};

export const revalidate = 3600;

export default async function JourneyPage() {
  const [phases, cities] = await Promise.all([
    getPhasesWithSteps(),
    getCities(),
  ]);

  // Steps that carry a due offset feed the one calm countdown banner.
  const deadlineSteps: DeadlineStep[] = phases
    .flatMap((phase) => phase.steps)
    .filter((s) => s.due_offset_days !== null)
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      dueOffsetDays: s.due_offset_days!,
      urgency: (s.deadline_urgency as "hard" | "soft" | null) ?? null,
      appliesTo: s.applies_to,
      cityVariable: s.city_variable,
    }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <div className="mb-6">
        <DeadlineClock steps={deadlineSteps} />
      </div>
      <JourneyBoard phases={phases} cities={cities} />
    </div>
  );
}
