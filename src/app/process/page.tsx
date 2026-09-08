import type { Metadata } from "next";
import { getPhasesWithSteps } from "@/lib/content";
import { ProcessTimeline } from "@/components/process/process-timeline";
import { Kicker } from "@/components/ui/kicker";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const BASE_URL = "https://www.germanyguide.net";

export const metadata: Metadata = {
  title: "How Moving to Germany Works, Step by Step",
  description:
    "Every step of the move to Germany, in five phases — visa, Anmeldung, residence permit, insurance, banking. Browse the whole journey free, no account needed.",
  alternates: { canonical: `${BASE_URL}/process` },
};

export const revalidate = 3600;

export default async function ProcessPage() {
  const phases = await getPhasesWithSteps();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Kicker>The process</Kicker>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
        From first thought to fully settled.
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        The whole journey, laid out in order. Every step links to a full guide —
        and the ones marked with a pin change depending on your city.
      </p>
      <div className="mt-6">
        <ButtonLink href="/plan" size="sm">
          Make it my plan
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>

      <ProcessTimeline phases={phases} />
    </div>
  );
}
