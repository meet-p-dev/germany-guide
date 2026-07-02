import Link from "next/link";
import type { Metadata } from "next";
import { getLetters } from "@/lib/queries/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "German official letters, explained",
  description:
    "Got a German letter you can't read? Find out what it means, whether it's urgent, and exactly what to do — Rundfunkbeitrag, Finanzamt, Krankenkasse and more.",
};

const URGENCY_STYLE: Record<string, string> = {
  urgent: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  "action-needed":
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  info: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default async function LettersPage() {
  const letters = await getLetters();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Letter helper</h1>
        <p className="max-w-2xl text-muted-foreground">
          German offices communicate by post, in German, with deadlines. Find
          your letter below to see what it means and what to do — before the
          deadline passes.
        </p>
      </div>

      {letters.length === 0 ? (
        <p className="rounded-md border bg-muted/40 p-6 text-sm text-muted-foreground">
          Letter explainers are being reviewed and will appear here shortly.
        </p>
      ) : (
        <ul className="space-y-3">
          {letters.map((letter) => (
            <li key={letter.id}>
              <Link
                href={`/letters/${letter.slug}`}
                className="block rounded-lg border bg-card p-4 hover:bg-accent"
              >
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium">{letter.title_de}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${URGENCY_STYLE[letter.urgency] ?? ""}`}
                  >
                    {letter.urgency === "action-needed"
                      ? "action needed"
                      : letter.urgency}
                  </span>
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
