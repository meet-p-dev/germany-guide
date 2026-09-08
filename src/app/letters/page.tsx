import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { getLetters } from "@/lib/content";
import { LetterDecoder } from "@/components/ai/assist";
import { Kicker } from "@/components/ui/kicker";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

const BASE_URL = "https://www.germanyguide.net";

export const metadata: Metadata = {
  title: "Decode Your German Official Mail",
  description:
    "Got an official German letter? Find out who sent it, what it means, how urgent it is, and exactly what to do — before you panic.",
  alternates: { canonical: `${BASE_URL}/letters` },
};

export const revalidate = 3600;

const URGENCY_STYLES: Record<string, string> = {
  high: "bg-primary-soft text-primary",
  medium: "bg-gold-soft text-gold",
  low: "bg-success-soft text-success",
};

const URGENCY_LABELS: Record<string, string> = {
  high: "Act now",
  medium: "Respond soon",
  low: "No rush",
};

export default async function LettersPage() {
  const letters = await getLetters();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Kicker>Letter helper</Kicker>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
        A German letter arrived. Don&apos;t panic.
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        Germany communicates by post, and every newcomer knows the small dread
        of a formal envelope. Find your letter below — who sent it, what it
        really says, and what to do about it.
      </p>

      <LetterDecoder />

      <Stagger className="mt-10 grid gap-4">
        {letters.map((letter) => (
          <StaggerItem key={letter.slug}>
            <Link
              href={`/letters/${letter.slug}`}
              className="group flex items-center gap-4 rounded-3xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Mail className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-display block text-lg font-bold leading-snug">
                  {letter.name}
                </span>
                <span className="mt-0.5 block text-sm text-muted">
                  {letter.german_name && (
                    <span className="italic">{letter.german_name}</span>
                  )}
                  {letter.german_name && letter.sender && " · "}
                  {letter.sender && <span>from {letter.sender}</span>}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    URGENCY_STYLES[letter.urgency] ?? URGENCY_STYLES.medium,
                  )}
                >
                  {URGENCY_LABELS[letter.urgency] ?? letter.urgency}
                </span>
                <ArrowRight className="h-5 w-5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      <p className="mt-10 rounded-2xl border border-border bg-card-muted/60 p-5 text-sm leading-relaxed text-muted">
        Your letter isn&apos;t here? The safe protocol for any official mail:
        never ignore it, translate all of it, find the deadline, verify payment
        details on the sender&apos;s official website.{" "}
        <Link
          href="/problems/incomprehensible-letter"
          className="font-semibold text-primary hover:underline"
        >
          Full guide →
        </Link>
      </p>
    </div>
  );
}
