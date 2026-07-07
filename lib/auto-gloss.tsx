import * as React from "react";
import { JargonGloss } from "@/components/ds";

export type GlossaryEntry = { term_de: string; term_en: string };

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Presentation-layer fix for Part-1 Rule 3 (Increment 1.5): DB content strings
 * (e.g. `tasks.summary`) contain bare German terms with no inline gloss. This
 * wraps the first, not-already-glossed occurrence of each recognized term in
 * <JargonGloss>, sourced from the `glossary_terms` table (term_de → term_en) —
 * WITHOUT editing any content string.
 *
 * Double-gloss safeguards:
 *  1. A term already used as a parenthetical gloss — "current account
 *     (Girokonto)" — is left untouched.
 *  2. A term already hand-glossed in this row (passed via `skipTerms`, e.g. the
 *     task title's German term) is skipped.
 *  3. Each distinct term is glossed at most once per text (first occurrence),
 *     so repeated terms don't repeat the gloss.
 */
export function autoGloss(
  text: string,
  glossary: GlossaryEntry[],
  opts?: { skipTerms?: string[] }
): React.ReactNode {
  if (!text || glossary.length === 0) return text;

  const byTerm = new Map(glossary.map((g) => [g.term_de, g.term_en]));
  // Longest terms first so a longer term wins over a substring of it.
  const sorted = [...byTerm.keys()].sort((a, b) => b.length - a.length);
  // Letter-boundary lookarounds (unicode) so German letters (ä/ö/ü/ß) count as
  // word chars — a plain \b would misfire around them.
  const re = new RegExp(
    `(?<![\\p{L}])(${sorted.map(escapeRegExp).join("|")})(?![\\p{L}])`,
    "gu"
  );

  const skip = (opts?.skipTerms ?? []).join(" ").toLowerCase();
  const glossed = new Set<string>();
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const term = m[1];
    const start = m.index;
    const end = start + term.length;

    const parenthesized = text[start - 1] === "(" && text[end] === ")";
    const inTitle = skip.includes(term.toLowerCase());
    const alreadyGlossed = glossed.has(term);
    if (parenthesized || inTitle || alreadyGlossed) continue;

    if (start > last) out.push(text.slice(last, start));
    out.push(
      <JargonGloss key={`ag-${key++}`} term={term} gloss={byTerm.get(term)!} />
    );
    glossed.add(term);
    last = end;
  }

  if (last < text.length) out.push(text.slice(last));
  return out.length === 0 ? text : out.length === 1 ? out[0] : out;
}
