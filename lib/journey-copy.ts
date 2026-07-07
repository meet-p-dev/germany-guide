/**
 * One-line framing for each journey stage, shown under the stage name on
 * /journey. Keyed by `task_categories.slug`.
 *
 * GUARDRAIL (Increment 1): each line describes the stage's ROLE in a
 * newcomer's journey ONLY — never a fact about German bureaucracy. No fees,
 * timelines, deadlines, rules, or figures live here. Every such fact comes
 * from the database (task summaries / guides). These lines also contain no
 * German bureaucratic term, so there is nothing to gloss (Rule 3): the German
 * terms + their plain-English glosses appear on the task rows, sourced from
 * `tasks.title_de` / `tasks.title_en`.
 */
export const STAGE_FRAMING: Record<string, string> = {
  registration:
    "Where the journey begins — the step that makes most of what follows possible.",
  residence:
    "Your legal footing to stay — the status the rest of your plans build on.",
  money:
    "The everyday essentials, so you can be paid, pay rent, and get set up.",
  health:
    "One of the foundations of daily life here — worth getting your head around.",
  work: "Turning the experience you already bring into something that counts here.",
  "daily-life":
    "The smaller pieces beyond the big official steps that make a place feel like home.",
};
