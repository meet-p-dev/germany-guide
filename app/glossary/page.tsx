import Link from "next/link";
import type { Metadata } from "next";
import { getGlossaryTerms } from "@/lib/queries/content";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "German bureaucracy glossary",
  description:
    "Anmeldung, Wohnungsgeberbestätigung, Fiktionsbescheinigung — the German official terms every newcomer runs into, explained in plain English.",
};

export default async function GlossaryPage() {
  const terms = await getGlossaryTerms();

  const byLetter = new Map<string, typeof terms>();
  for (const term of terms) {
    const letter = term.term_de[0].toUpperCase();
    byLetter.set(letter, [...(byLetter.get(letter) ?? []), term]);
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Glossary
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          The German terms, in plain English
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          The German terms you will meet on forms, letters and at the counter —
          in plain English.
        </p>
      </header>

      {[...byLetter.entries()].map(([letter, letterTerms]) => (
        <section key={letter} className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            {letter}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {letterTerms.map((term) => (
              <li key={term.id}>
                <Link
                  href={`/glossary/${term.slug}`}
                  className="block rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-secondary/40"
                >
                  <span className="font-semibold">{term.term_de}</span>{" "}
                  <span className="text-sm text-muted-foreground">
                    — {term.term_en}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
