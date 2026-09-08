import { formatCost, type CityStep, type Step, type StepMeta } from "@/lib/content";

/** The site title suffix appended by the root `title.template`. */
const TITLE_SUFFIX = " · Germany Guide";
const TITLE_BUDGET = 60;
const DESCRIPTION_BUDGET = 160;

/**
 * Search-first labels for the per-city step pages.
 *
 * The editorial `steps.title` is written for someone already reading the page
 * ("Get your residence permit (Aufenthaltstitel)"). Appending " in <City>" and
 * the site suffix pushed 60 of the 126 city-step pages past 60 characters, so
 * Google truncated the city — the one word the page actually ranks for. These
 * labels lead with the term people search and leave room for the city name.
 *
 * A step with no entry falls back to `steps.title`, so a new step still gets a
 * correct (if longer) title rather than a broken one.
 */
const CITY_STEP_SEARCH_LABEL: Record<string, string> = {
  anmeldung: "Anmeldung",
  "residence-permit": "Residence Permit",
  "visa-extension": "Visa Extension",
  "public-transport": "Student Transport Ticket",
  "find-housing-remotely": "Student Housing",
};

/** How the method chip reads as a title hook — short, and a real claim. */
const METHOD_HOOK: Record<string, string> = {
  walk_in: "Walk-In",
  appointment: "Appointment Only",
  email: "By Email",
  online: "Apply Online",
  post: "By Post",
};

/**
 * Steps whose `method = "online"` must never be surfaced as "starts online".
 *
 * The federal eWA takes a German Personalausweis or an EU/EEA eID-Karte only,
 * so no first-time third-country arrival — this site's core reader — can
 * register online anywhere in Germany. 13 cities still carry the stale
 * `method = "online"` on `anmeldung` (see docs/todo.md); putting that word in a
 * title or snippet would push a known-wrong claim into the search results,
 * which is worse than the chip on the page. For these steps we fall back to
 * `method_note`, which already leads with the real in-person route.
 * See docs/solutions.md, "Register online was wrong for our whole audience".
 */
const ONLINE_CLAIM_UNSAFE = new Set(["anmeldung"]);

/** How the method reads mid-sentence in a description. */
const METHOD_SENTENCE: Record<string, string> = {
  walk_in: "takes walk-ins",
  appointment: "is appointment-only",
  email: "is handled by email",
  online: "starts online",
  post: "is handled by post",
};

/** The method, unless claiming it would mislead this site's readers. */
function safeMethod(
  stepSlug: string,
  method: string | null | undefined,
): string | null {
  if (!method) return null;
  if (method === "online" && ONLINE_CLAIM_UNSAFE.has(stepSlug)) return null;
  return method;
}

/**
 * The closing call to action. Documents and deadlines are the right promise for
 * a counter appointment; they are not what someone reading the housing or
 * transport step came for.
 */
const STEP_CTA: Record<string, (city: string) => string> = {
  "public-transport": (city) =>
    `See what the student ticket costs in ${city}.`,
  "find-housing-remotely": (city) =>
    `See what a room costs in ${city} and where to look.`,
};

/** Words that mean a `method_note` has already told the reader the method. */
const METHOD_KEYWORD: Record<string, RegExp> = {
  walk_in: /walk[-\s]?in/i,
  appointment: /appointment|termin/i,
  email: /e-?mail/i,
  online: /online|portal/i,
  post: /\bpost\b|by mail/i,
};

function mentionsMethod(note: string, method: string): boolean {
  return METHOD_KEYWORD[method]?.test(note) ?? false;
}

/** Trim to a word boundary so a truncated string never ends mid-word. */
function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-–—]+$/, "")}…`;
}

/**
 * "Anmeldung in Munich: Appointment Only" — keyword first, city second, and the
 * local method as the value hook, but only when the whole thing still fits in
 * `TITLE_BUDGET` *including* the site suffix the layout template adds.
 */
export function cityStepTitle(
  stepSlug: string,
  stepTitle: string,
  cityName: string,
  method?: string | null,
): string {
  const label = CITY_STEP_SEARCH_LABEL[stepSlug] ?? stepTitle;
  const base = `${label} in ${cityName}`;
  const usableMethod = safeMethod(stepSlug, method);
  const hook = usableMethod ? METHOD_HOOK[usableMethod] : null;
  if (hook) {
    const withHook = `${base}: ${hook}`;
    if (withHook.length + TITLE_SUFFIX.length <= TITLE_BUDGET) return withHook;
  }
  return base;
}

/**
 * The office clause for a snippet — "at the Ausländerbehörde Stuttgart", "at
 * any Stuttgart Bürgerbüro". `address` is a free-text field written for the
 * page, so most of its shapes do not survive being dropped mid-sentence; this
 * only accepts the ones that read as a plain office name and gives up
 * otherwise, leaving a shorter but correct description.
 */
function officeClause(address: string | null | undefined): string | null {
  if (!address) return null;
  const first = address
    .split(/[,;]|\s[—–]\s/)[0]!
    .trim()
    .replace(/\.$/, "");
  if (!first || first.length > 60) return null;
  // A digit means a street number or a count ("~40 citywide"), not a name.
  if (/\d/.test(first)) return null;
  // A leftover period or colon means the segment was really several clauses
  // ("Main location: …", "Workers & families: …").
  if (/[.:]/.test(first)) return null;
  // Splitting can cut a parenthetical in half ("(district offices across …").
  const opens = (first.match(/\(/g) ?? []).length;
  const closes = (first.match(/\)/g) ?? []).length;
  if (opens !== closes) return null;
  // "Any of Cologne's 9 Kundenzentren" never reads well mid-sentence.
  if (/^any of\b/i.test(first)) return null;
  const any = first.match(/^any\s+(.*)$/i);
  return any ? `at any ${any[1]}` : `at the ${first}`;
}

/**
 * Ad-style snippet built only from verified row data plus a call to action:
 * "Anmeldung in Munich is appointment-only, at the Bürgerbüros of the KVR.
 *  See the documents, fees and deadline for your Munich move."
 */
export function cityStepDescription(params: {
  stepSlug: string;
  stepTitle: string;
  cityName: string;
  method?: string | null;
  methodNote?: string | null;
  address?: string | null;
  fallback?: string | null;
}): string {
  const { stepSlug, stepTitle, cityName, method, methodNote, address, fallback } =
    params;
  const label = CITY_STEP_SEARCH_LABEL[stepSlug] ?? stepTitle;
  const verb = METHOD_SENTENCE[safeMethod(stepSlug, method) ?? ""] ?? null;

  let lead: string;
  if (verb) {
    const office = officeClause(address);
    lead = office
      ? `${label} in ${cityName} ${verb}, ${office}.`
      : `${label} in ${cityName} ${verb}.`;
  } else if (methodNote) {
    // The lead clause is the route itself; anything after the ";" is a caveat
    // that does not survive being cut short in a snippet.
    const route = methodNote.split(";")[0]!.trim().replace(/\.$/, "");
    lead = `${label} in ${cityName}: ${route}.`;
  } else {
    lead = `${label} in ${cityName}.`;
  }

  const cta = (
    STEP_CTA[stepSlug] ??
    ((city: string) =>
      `See the documents, costs and deadline for your ${city} move.`)
  )(cityName);
  const full = `${lead} ${cta}`;
  if (full.length <= DESCRIPTION_BUDGET) return full;
  if (lead.length <= DESCRIPTION_BUDGET) return lead;
  return clamp(fallback ?? lead, DESCRIPTION_BUDGET);
}

/**
 * The "people also ask" pairs for a city step — **every answer is an existing
 * verified field**, never generated prose. The same pairs render visibly in
 * `CompactStepView`, which is what makes the FAQPage markup legitimate: the
 * schema describes content that is actually on the page.
 */
export function cityStepFaq(params: {
  stepSlug: string;
  stepTitle: string;
  cityName: string;
  variant: Pick<CityStep, "method" | "method_note" | "address"> | null;
  meta: StepMeta;
  step: Pick<Step, "documents" | "summary">;
}): Array<{ question: string; answer: string }> {
  const { stepSlug, stepTitle, cityName, variant, meta } = params;
  const label = CITY_STEP_SEARCH_LABEL[stepSlug] ?? stepTitle;
  const faq: Array<{ question: string; answer: string }> = [];

  // Same guard as the snippet: never answer "it starts online" for a step where
  // that is untrue for this site's readers (see ONLINE_CLAIM_UNSAFE).
  const usable = safeMethod(stepSlug, variant?.method);
  const verb = METHOD_SENTENCE[usable ?? ""] ?? null;
  const note = variant?.method_note?.trim().replace(/\.$/, "");
  if (verb || note) {
    // "Anmeldung in Munich is appointment-only. Appointment required." — when
    // the note already names the method, the sentence only repeats it.
    const noteRepeatsMethod =
      !!note && !!usable && mentionsMethod(note, usable);
    faq.push({
      question: `How do you arrange ${label} in ${cityName}?`,
      answer:
        note && (noteRepeatsMethod || !verb)
          ? `${label} in ${cityName}: ${note}.`
          : [verb ? `${label} in ${cityName} ${verb}.` : null, note ? `${note}.` : null]
              .filter(Boolean)
              .join(" "),
    });
  }

  if (variant?.address) {
    faq.push({
      question: `Which office handles ${label} in ${cityName}?`,
      answer: variant.address,
    });
  }

  const cost = formatCost(meta.costCents, meta.costType);
  if (cost) {
    // The note often restates the figure ("Free" / "Free"); same dedupe the
    // compact card does, so the answer never reads "Free — Free."
    const costNote =
      meta.costNote &&
      meta.costNote.trim().toLowerCase() !== cost.trim().toLowerCase()
        ? meta.costNote.trim().replace(/\.$/, "")
        : null;
    faq.push({
      question: `What does ${label} cost in ${cityName}?`,
      answer: costNote ? `${cost} (${costNote}).` : cost,
    });
  }

  if (meta.deadlineRule) {
    faq.push({
      question: `What is the deadline for ${label} in ${cityName}?`,
      answer: meta.deadlineRule,
    });
  }

  return faq.slice(0, 4);
}
