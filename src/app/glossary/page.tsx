import type { Metadata } from "next";
import { getGlossaryTerms } from "@/lib/content";
import { Kicker } from "@/components/ui/kicker";
import { Markdown } from "@/components/markdown";

export const metadata: Metadata = {
  title: "Glossary — German bureaucracy, translated",
  description:
    "Anmeldung, Ausländerbehörde, Wohnungsgeberbestätigung — every German bureaucracy term explained in plain English.",
};

export const revalidate = 3600;

export default async function GlossaryPage() {
  const terms = await getGlossaryTerms();

  const grouped = terms.reduce<Map<string, typeof terms>>((map, term) => {
    const letter = term.term.charAt(0).toUpperCase();
    const list = map.get(letter) ?? [];
    list.push(term);
    map.set(letter, list);
    return map;
  }, new Map());

  const letters = [...grouped.keys()].sort();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Kicker>Glossary</Kicker>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
        German bureaucracy, translated.
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        The words on your letters, forms and office doors — each one in plain
        English. The German terms are worth learning; officials will use them,
        and now they won&apos;t scare you.
      </p>

      {/* letter index */}
      <nav
        aria-label="Alphabetical index"
        className="sticky top-16 z-10 -mx-4 mt-8 flex gap-1 overflow-x-auto border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6"
      >
        {letters.map((letter) => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-muted transition-colors hover:bg-primary-soft hover:text-primary"
          >
            {letter}
          </a>
        ))}
      </nav>

      <div className="mt-8 space-y-12">
        {letters.map((letter) => (
          <section key={letter} id={`letter-${letter}`} className="scroll-mt-32">
            <h2 className="font-display text-2xl font-bold text-primary">
              {letter}
            </h2>
            <dl className="mt-4 space-y-4">
              {grouped.get(letter)!.map((term) => (
                <div
                  key={term.slug}
                  id={term.slug}
                  className="scroll-mt-32 rounded-2xl border border-border bg-card p-5"
                >
                  <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-display text-lg font-bold">
                      {term.term}
                    </span>
                    {term.english && (
                      <span className="text-sm text-muted">{term.english}</span>
                    )}
                  </dt>
                  <dd className="mt-2">
                    <Markdown className="prose-sm">
                      {term.definition_md}
                    </Markdown>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
