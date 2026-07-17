import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Star,
  Users,
  type LucideIcon,
} from "lucide-react";
import { PERSONAS } from "@/lib/site-config";
import { Kicker } from "@/components/ui/kicker";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const PERSONA_ICONS: Record<string, LucideIcon> = {
  student: GraduationCap,
  worker: Briefcase,
  refugee: HeartHandshake,
  "eu-citizen": Star,
  family: Users,
};

export function PersonasSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="rounded-[2.5rem] border border-border bg-card-muted/60 p-8 sm:p-12">
        <Reveal>
          <Kicker>For everyone arriving</Kicker>
          <h2 className="font-display mt-3 max-w-2xl text-4xl font-bold sm:text-[2.75rem] sm:leading-[1.1]">
            Whoever you are, there&apos;s a path for you.
          </h2>
        </Reveal>

        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PERSONAS.map((persona) => {
            const Icon = PERSONA_ICONS[persona.slug] ?? Users;
            const live = persona.status === "live";
            const inner = (
              <>
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  {!live && (
                    <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
                      Coming soon
                    </span>
                  )}
                </div>
                <h3 className="font-display mt-5 text-xl font-bold">
                  {persona.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {persona.description}
                </p>
              </>
            );

            return (
              <StaggerItem key={persona.slug} className="h-full">
                {live ? (
                  <Link
                    href={`/plan?persona=${persona.slug}`}
                    className="block h-full rounded-3xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="h-full rounded-3xl border border-dashed border-border bg-card/50 p-7 opacity-80">
                    {inner}
                  </div>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
