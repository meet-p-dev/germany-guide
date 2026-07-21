import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  GraduationCap,
  HeartPulse,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { Kicker } from "@/components/ui/kicker";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const REASONS: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}[] = [
  {
    icon: GraduationCap,
    title: "World-class study, little to no tuition",
    description:
      "Public universities charge no tuition — just a small semester fee — and a German degree travels the world.",
    href: "/guide/choose-university-or-job",
  },
  {
    icon: Briefcase,
    title: "A job market hungry for talent",
    description:
      "Europe's largest economy has a real skills shortage — the EU Blue Card and Chancenkarte are built to bring you in.",
    href: "/guide/understand-your-paths",
  },
  {
    icon: Landmark,
    title: "A path that leads somewhere",
    description:
      "Stay 18 months to job-hunt after graduating, and settle toward permanent residence and citizenship.",
    href: "/guide/residence-permit",
  },
  {
    icon: HeartPulse,
    title: "Healthcare that has your back",
    description:
      "From day one you're covered by one of the world's most reliable public health systems.",
    href: "/guide/health-insurance-from-home",
  },
];

export function WhyGermany() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Kicker>The honest case</Kicker>
          <h2 className="font-display mt-3 max-w-2xl text-5xl font-extrabold sm:text-6xl">
            Why Germany?
          </h2>
        </div>
        <Link
          href="/why-germany"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          Read the full case
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Reveal>

      <Stagger className="mt-12 grid gap-5 sm:grid-cols-2">
        {REASONS.map((reason) => (
          <StaggerItem key={reason.title} className="h-full">
            <Link
              href={reason.href}
              className="group flex h-full items-start gap-4 rounded-3xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <reason.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="font-display flex items-center gap-1.5 text-lg font-bold">
                  {reason.title}
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
                <span className="mt-1.5 block leading-relaxed text-muted">
                  {reason.description}
                </span>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
