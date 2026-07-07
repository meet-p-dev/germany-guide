/**
 * Guided-mode dashboard (Increment 4). Pure helpers that turn the assembled
 * six-stage plan (from the quiz, lib/quiz.ts) into a single linear list of
 * steps with one "you are here" cursor — the core of the "never the whole
 * mountain, always the one next step" principle.
 *
 * No accounts, no DB writes: the cursor lives in the browser (session/local
 * storage), consistent with how the quiz and the anonymous checklist already
 * persist. Cross-session/device persistence is deliberately Increment 5.
 */
import type { PlanStage, QuizAnswers } from "@/lib/quiz";

/** A single actionable task, lifted out of its stage into one ordered list. */
export type FlatStep<T> = {
  task: T;
  /** 1-based index of the stage this task belongs to (for "Stage X of 6"). */
  stageIndex: number;
  stageSlug: string;
  stageName: string;
  /**
   * Honest per-step note (journey mode only): e.g. the nationality/embassy hint
   * or the "runs alongside the others" context. Undefined in category mode.
   */
  note?: string | null;
  /**
   * Task slugs this step genuinely overlaps with in time (journey mode only) —
   * lets the UI say "can be done around the same time" instead of implying a
   * forced 1-2-3 chain. Empty/undefined when there is no real overlap.
   */
  parallelWith?: string[];
};

/** Flatten the six persona-filtered stages into one ordered task list. */
export function flattenPlan<T>(plan: PlanStage<T>[]): FlatStep<T>[] {
  const steps: FlatStep<T>[] = [];
  plan.forEach((stage, i) => {
    for (const task of stage.tasks) {
      steps.push({
        task,
        stageIndex: i + 1,
        stageSlug: stage.slug,
        stageName: stage.name_en,
      });
    }
  });
  return steps;
}

/**
 * Journey mode (student persona): flatten the chronological journey rows into
 * the same ordered FlatStep list the dashboard already renders — but ordered by
 * the real `phase_order` (a strictly-increasing global rank) and grouped by
 * `journey_phases`, NOT by browsing category. Each step carries its honest note
 * and its genuine parallel-task slugs so the UI can show concurrency instead of
 * a false chain.
 *
 * `stageIndex` is the phase's 1-based rank (so the existing "Stage X of N" and
 * the ProgressBar keep working); `total` phases replaces the hard-coded 6.
 */
export type JourneyPhaseLike = { slug: string; name_en: string; sort_order: number };
export type JourneyStepLike<T> = {
  task: T | null;
  phase: string;
  phase_order: number;
  note_md: string | null;
  /** task ids; resolved to slugs by the caller into parallelSlugs */
  parallelSlugs: string[];
};

export function flattenJourney<T extends { slug: string }>(
  phases: JourneyPhaseLike[],
  steps: JourneyStepLike<T>[]
): FlatStep<T>[] {
  const phaseRank = new Map(phases.map((p) => [p.slug, p.sort_order]));
  const phaseName = new Map(phases.map((p) => [p.slug, p.name_en]));
  return steps
    .filter((s): s is JourneyStepLike<T> & { task: T } => s.task != null)
    .slice()
    .sort((a, b) => a.phase_order - b.phase_order)
    .map((s) => ({
      task: s.task,
      stageIndex: phaseRank.get(s.phase) ?? 0,
      stageSlug: s.phase,
      stageName: phaseName.get(s.phase) ?? s.phase,
      note: s.note_md,
      parallelWith: s.parallelSlugs,
    }));
}

/** Count of distinct phases actually present in a flattened step list. */
export function phaseCount<T>(steps: FlatStep<T>[]): number {
  return new Set(steps.map((s) => s.stageIndex)).size;
}

/**
 * Seed the progress cursor from the quiz's "where are you now" answer (Q5:
 * 1..6, or 7 = mostly settled). Everything in an earlier stage is treated as
 * already done, so the user lands on the first task of their current stage.
 */
export function seedCursor<T>(steps: FlatStep<T>[], stage: number): number {
  if (stage >= 7) return steps.length; // mostly settled → everything folded
  return steps.filter((s) => s.stageIndex < stage).length;
}

/** Keep a stored cursor in range — the plan can change between visits. */
export function clampCursor(cursor: number, length: number): number {
  return Math.max(0, Math.min(cursor, length));
}

/** % of the plan folded into "done" — the reassurance figure (Rule 4). */
export function percentSettled(cursor: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((cursor / total) * 100);
}

/** localStorage key: cursor is scoped to the plan identity so switching
 *  persona/city re-seeds rather than resuming someone else's position. */
export function progressKey(answers: QuizAnswers): string {
  return `${answers.persona ?? "?"}:${answers.city ?? "none"}`;
}

/**
 * Honest deadlines. A step shows a deadline ONLY where a genuine, sourced
 * statutory deadline exists — never an invented one. Today that is Anmeldung
 * alone (§17 Bundesmeldegesetz: 14 days from moving in). Broad per-task
 * deadline data is future content/schema work; until then every other step's
 * deadline slot stays empty rather than faked.
 */
export const STEP_DEADLINES: Record<string, string> = {
  anmeldung: "Within 14 days of moving in",
};

export function deadlineFor(taskSlug: string): string | undefined {
  return STEP_DEADLINES[taskSlug];
}

/** Short, honest documents label for the current card, or undefined. */
export function docsLabel(count: number | null | undefined): string | undefined {
  if (!count || count <= 0) return undefined;
  return `${count} document${count === 1 ? "" : "s"} needed`;
}
