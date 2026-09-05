/**
 * Form state shapes for the newsletter Server Actions.
 *
 * These live outside the `"use server"` files on purpose: such a file may only
 * export async functions, so exporting an `initial…State` **object** from one
 * throws at request time ("A 'use server' file can only export async functions,
 * found object") — and `next build` does not catch it, because the module is
 * only evaluated when the route actually runs.
 */

export interface SubscribeState {
  ok: boolean;
  /** Message safe to render verbatim; never reveals list membership. */
  message: string;
  /** Distinguishes "nothing submitted yet" from a real answer, for the UI. */
  submitted: boolean;
}

export const initialSubscribeState: SubscribeState = {
  ok: false,
  message: "",
  submitted: false,
};

export interface TokenState {
  outcome:
    | "idle"
    | "confirmed"
    | "unsubscribed"
    | "already"
    | "invalid"
    | "unavailable";
}

export const initialTokenState: TokenState = { outcome: "idle" };

export interface DigestActionState {
  message: string;
  ok: boolean;
  submitted: boolean;
}

export const initialDigestActionState: DigestActionState = {
  message: "",
  ok: false,
  submitted: false,
};

export interface MyNewsletterState {
  state: "none" | "pending" | "confirmed" | "unsubscribed";
  /** False when the keys are missing, so the UI can say so instead of failing. */
  available: boolean;
  email: string | null;
}
