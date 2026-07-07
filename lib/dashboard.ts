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
