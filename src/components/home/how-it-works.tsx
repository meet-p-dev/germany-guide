import { ClipboardList, ListChecks, UserRound } from "lucide-react";
import { Kicker } from "@/components/ui/kicker";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const STEPS = [
  {
    icon: UserRound,
    title: "Tell us your story",
    description:
      "Student or worker, exploring or already here — pick your situation, and your city once you know it.",
  },
  {
    icon: ClipboardList,
    title: "Get your roadmap",
    description:
      "A phase-by-phase checklist, ordered so nothing blocks the next step.",
  },
  {
    icon: ListChecks,
    title: "Track & settle",
    description:
      "Tick off each task, see your progress, and know exactly what's next.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <Kicker>How it works</Kicker>
        <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold sm:text-[2.75rem] sm:leading-[1.1]">
          One calm flow, from touchdown to fully settled.
        </h2>
      </Reveal>

      <Stagger className="mt-12 grid gap-5 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <StaggerItem key={step.title}>
            <div className="h-full rounded-3xl border border-border bg-card p-7 transition-shadow duration-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-sm font-bold text-muted">
                  0{i + 1}
                </span>
              </div>
              <h3 className="font-display mt-5 text-xl font-bold">
                {step.title}
              </h3>
              <p className="mt-2.5 leading-relaxed text-muted">
                {step.description}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
