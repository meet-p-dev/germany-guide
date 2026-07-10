import Link from "next/link";
import type { Metadata } from "next";
import { getLetters } from "@/lib/queries/content";
import { StatusBadge, type StatusTone } from "@/components/ui/StatusBadge";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "German official letters, explained",
  description:
    "Got a German letter you can't read? Find out what it means, whether it's urgent, and exactly what to do — Rundfunkbeitrag, Finanzamt, Krankenkasse and more.",
};

const URGENCY_TONE: Record<string, StatusTone> = {
  urgent: "danger",
  "action-needed": "warning",
  info: "neutral",
};

export default async function LettersPage() {
  const letters = await getLetters();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Letter helper
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          German letters, decoded
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          German offices communicate by post, in German, with deadlines. Find
          your letter below to see what it means and what to do — before the
          deadline passes.
        </p>
      </header>

      {letters.length === 0 ? (
        <p className="rounded-2xl border border-border bg-secondary/40 p-6 text-sm text-muted-foreground">
          Letter explainers are being reviewed and will appear here shortly.
        </p>
      ) : (
        <ul className="space-y-3">
          {letters.map((letter) => (
            <li key={letter.id}>
              <Link
                href={`/letters/${letter.slug}`}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{letter.title_de}</span>
                  <StatusBadge tone={URGENCY_TONE[letter.urgency] ?? "neutral"}>
                    {letter.urgency === "action-needed"
                      ? "action needed"
                      : letter.urgency}
                  </StatusBadge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {letter.title_en}
                  {letter.sender ? ` — from ${letter.sender}` : ""}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
