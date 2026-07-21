"use client";

import { useMemo, useState } from "react";
import { Search, SearchX } from "lucide-react";
import type { GlossaryTerm } from "@/lib/content";
import { Markdown } from "@/components/markdown";

/**
 * The glossary as a searchable list: type any part of the German term, the
 * English translation, or the definition and the list narrows live. The
 * alphabet index stays for browsing; it hides while a search is active
 * because filtered results no longer cover every letter.
 */
export function GlossaryBrowser({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      needle
        ? terms.filter(
            (term) =>
              term.term.toLowerCase().includes(needle) ||
              (term.english ?? "").toLowerCase().includes(needle) ||
              term.definition_md.toLowerCase().includes(needle),
          )
        : terms,
    [terms, needle],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, GlossaryTerm[]>();
    for (const term of filtered) {
      const letter = term.term.charAt(0).toUpperCase();
      const list = map.get(letter) ?? [];
      list.push(term);
      map.set(letter, list);
    }
    return map;
  }, [filtered]);

  const letters = [...grouped.keys()].sort();

  return (
    <div>
      {/* search + letter index, pinned together under the header */}
      <div className="sticky top-16 z-10 -mx-4 mt-8 border-b border-border bg-background/90 px-4 pb-1 backdrop-blur-md sm:-mx-6 sm:px-6">
        <label className="relative block">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a term — Anmeldung, tax ID, Vollmacht…"
            aria-label="Search the glossary"
            className="h-11 w-full rounded-full border border-border bg-card pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-primary"
          />
        </label>

        {!needle && (
          <nav
            aria-label="Alphabetical index"
            className="flex gap-1 overflow-x-auto py-2"
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
        )}
        {needle && (
          <p className="py-2.5 text-sm text-muted" aria-live="polite">
            {filtered.length === 0
              ? "No terms match"
              : `${filtered.length} ${filtered.length === 1 ? "term" : "terms"} match`}
            {" — "}
            <button
              type="button"
              onClick={() => setQuery("")}
              className="font-semibold text-primary hover:underline"
            >
              clear search
            </button>
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border p-10 text-center">
          <SearchX className="h-6 w-6 text-muted" aria-hidden />
          <p className="font-display font-bold">
            Nothing here for &ldquo;{query.trim()}&rdquo;
          </p>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Try the German spelling (ä, ö, ü matter) or a shorter fragment —
            &ldquo;meld&rdquo; finds Anmeldung, Abmeldung and Ummeldung.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {letters.map((letter) => (
            <section
              key={letter}
              id={`letter-${letter}`}
              className="scroll-mt-32"
            >
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
                        <span className="text-sm text-muted">
                          {term.english}
                        </span>
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
      )}
    </div>
  );
}
