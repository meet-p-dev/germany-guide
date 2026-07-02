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
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Glossary</h1>
        <p className="max-w-2xl text-muted-foreground">
          The German terms you will meet on forms, letters and at the counter —
          in plain English.
        </p>
      </div>

      {[...byLetter.entries()].map(([letter, letterTerms]) => (
        <section key={letter} className="space-y-2">
          <h2 className="text-lg font-semibold text-muted-foreground">
            {letter}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {letterTerms.map((term) => (
              <li key={term.id}>
                <Link
                  href={`/glossary/${term.slug}`}
                  className="block rounded-lg border bg-card p-3 hover:bg-accent"
                >
                  <span className="font-medium">{term.term_de}</span>{" "}
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
