/**
 * State shapes for the review-gate Server Actions.
 *
 * These live outside the `"use server"` module on purpose: such a file may only
 * export async functions, and exporting a plain object from one throws
 * "A 'use server' file can only export async functions" at request time — a
 * failure `npm run build` does not catch. Same reason as newsletter-state.ts.
 */

export interface ReviewActionState {
  ok: boolean;
  message: string;
  /** False until an action has actually run, so nothing is reported on load. */
  submitted: boolean;
}

export const initialReviewActionState: ReviewActionState = {
  ok: false,
  message: "",
  submitted: false,
};
