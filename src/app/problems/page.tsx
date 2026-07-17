import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, LifeBuoy } from "lucide-react";
import { getProblems } from "@/lib/content";
import { Kicker } from "@/components/ui/kicker";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Problems & solutions",
  description:
    "No appointment slots, landlord won't sign, visa expiring before your appointment — the classic newcomer crises in Germany, each with a calm way out.",
};

export const revalidate = 3600;

export default async function ProblemsPage() {
  const problems = await getProblems();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Kicker>Problems &amp; solutions</Kicker>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
        Stuck? You&apos;re not the first.
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        Every one of these situations feels like an emergency the first time —
        and every one of them has a known way out. Find yours, breathe, follow
        the steps.
      </p>

      <Stagger className="mt-10 grid gap-4">
        {problems.map((problem) => (
          <StaggerItem key={problem.slug}>
            <Link
              href={`/problems/${problem.slug}`}
              className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <LifeBuoy className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display block text-lg font-bold leading-snug">
                  {problem.title}
                </span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
