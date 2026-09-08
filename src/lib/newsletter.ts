import { z } from "zod";
import { confirmationEmail } from "@/lib/email/templates";
import { emailConfigured, sendEmail } from "@/lib/email/send";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/service-client";

/**
 * Opt-in newsletter, double opt-in throughout.
 *
 * Consent rules this file enforces, because getting them wrong is a legal
 * problem and not a bug (GDPR Art. 6(1)(a), UWG section 7(2)):
 * - a row only becomes a recipient at `status = 'confirmed'`, which requires a
 *   click on a link sent to the address itself;
 * - `confirmed_at` is retained as the evidence that consent was given;
 * - unsubscribing is one click, no login, and never deletes the row (we must be
 *   able to prove the address opted out).
 *
 * The public entry points also refuse to reveal whether an address is already
 * on the list: every outcome of `subscribe` reads the same to the caller, so
 * the form cannot be used to test who has an account.
 */

export const BASE_URL = "https://www.germanyguide.net";

/** One confirmation email per address per this window, to stop mail-bombing. */
const RESEND_COOLDOWN_MS = 5 * 60 * 1000;

const emailSchema = z
  .string()
  .trim()
  .min(3)
  .max(254)
  .email();

export type ConsentSource = "footer" | "updates" | "account";

export interface SubscribeResult {
  ok: boolean;
  /** Message safe to render verbatim; never reveals list membership. */
  message: string;
}

const CHECK_INBOX =
  "Almost there — check your inbox and open the confirmation link. Nothing is sent to you until you do.";

export function newsletterConfigured(): boolean {
  return hasServiceRole() && emailConfigured();
}

export function confirmUrl(token: string): string {
  return `${BASE_URL}/newsletter/confirm?token=${token}`;
}

export function unsubscribeUrl(token: string): string {
  return `${BASE_URL}/newsletter/unsubscribe?token=${token}`;
}

/**
 * Start (or restart) a subscription. Always sends the confirmation email; never
 * marks anything confirmed.
 */
export async function subscribe({
  email,
  source,
  userId = null,
  citySlug = null,
}: {
  email: string;
  source: ConsentSource;
  userId?: string | null;
  citySlug?: string | null;
}): Promise<SubscribeResult> {
  const parsed = emailSchema.safeParse(email);
  if (!parsed.success) {
    return { ok: false, message: "That does not look like an email address." };
  }
  const address = parsed.data.toLowerCase();

  if (!newsletterConfigured()) {
    return {
      ok: false,
      message:
        "Email sending is not switched on yet. Please try again shortly — nothing was saved.",
    };
  }

  const db = createServiceClient();

  const { data: existing, error: lookupError } = await db
    .from("newsletter_subscribers")
    .select("id, status, confirm_token, created_at, last_sent_at")
    .eq("email", address)
    .maybeSingle();

  if (lookupError) {
    return { ok: false, message: "Something went wrong. Please try again." };
  }

  // Already on the list: say nothing that confirms it, and send nothing.
  if (existing?.status === "confirmed") {
    return { ok: true, message: CHECK_INBOX };
  }

  let token: string;

  if (existing) {
    const lastSent = existing.last_sent_at ?? existing.created_at;
    const tooSoon =
      Date.now() - new Date(lastSent).getTime() < RESEND_COOLDOWN_MS;
    if (tooSoon) {
      // Silently succeed: a bot hammering the form learns nothing, and the
      // person who genuinely double-clicked still sees a sensible message.
      return { ok: true, message: CHECK_INBOX };
    }

    // Re-issue the secret so an older link cannot be replayed.
    token = crypto.randomUUID();
    const { error } = await db
      .from("newsletter_subscribers")
      .update({
        status: "pending",
        confirm_token: token,
        consent_source: source,
        user_id: userId,
        city_slug: citySlug,
        unsubscribed_at: null,
        last_sent_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) {
      return { ok: false, message: "Something went wrong. Please try again." };
    }
  } else {
    token = crypto.randomUUID();
    const { error } = await db.from("newsletter_subscribers").insert({
      email: address,
      status: "pending",
      confirm_token: token,
      consent_source: source,
      user_id: userId,
      city_slug: citySlug,
      last_sent_at: new Date().toISOString(),
    });
    if (error) {
      return { ok: false, message: "Something went wrong. Please try again." };
    }
  }

  const { subject, html, text } = confirmationEmail(confirmUrl(token));
  const sent = await sendEmail({ to: address, subject, html, text });

  if (!sent.ok) {
    return {
      ok: false,
      message:
        "We could not send the confirmation email just now. Please try again in a few minutes.",
    };
  }

  return { ok: true, message: CHECK_INBOX };
}

export type ConfirmOutcome = "confirmed" | "already" | "invalid" | "unavailable";

export async function confirmSubscription(
  token: string,
): Promise<ConfirmOutcome> {
  if (!hasServiceRole()) return "unavailable";
  if (!/^[0-9a-f-]{36}$/i.test(token)) return "invalid";

  const db = createServiceClient();
  const { data: row, error } = await db
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("confirm_token", token)
    .maybeSingle();

  if (error) return "unavailable";
  if (!row) return "invalid";
  if (row.status === "confirmed") return "already";

  const { error: updateError } = await db
    .from("newsletter_subscribers")
    .update({
      status: "confirmed",
      confirmed_at: new Date().toISOString(),
      unsubscribed_at: null,
    })
    .eq("id", row.id);

  return updateError ? "unavailable" : "confirmed";
}

export type UnsubscribeOutcome =
  | "unsubscribed"
  | "already"
  | "invalid"
  | "unavailable";

export async function unsubscribeByToken(
  token: string,
): Promise<UnsubscribeOutcome> {
  if (!hasServiceRole()) return "unavailable";
  if (!/^[0-9a-f-]{36}$/i.test(token)) return "invalid";

  const db = createServiceClient();
  const { data: row, error } = await db
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (error) return "unavailable";
  if (!row) return "invalid";
  if (row.status === "unsubscribed") return "already";

  // Keep the row: it is the record that this address asked to be left alone.
  const { error: updateError } = await db
    .from("newsletter_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("id", row.id);

  return updateError ? "unavailable" : "unsubscribed";
}

export type SubscriptionState = "none" | "pending" | "confirmed" | "unsubscribed";

/** Current state for a signed-in user, for the toggle in /account. */
export async function getSubscriptionStateForEmail(
  email: string,
): Promise<SubscriptionState> {
  if (!hasServiceRole()) return "none";
  const db = createServiceClient();
  const { data } = await db
    .from("newsletter_subscribers")
    .select("status")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (!data) return "none";
  return data.status as SubscriptionState;
}

/** Unsubscribe from the account page, where the session already proves identity. */
export async function unsubscribeByEmail(email: string): Promise<boolean> {
  if (!hasServiceRole()) return false;
  const db = createServiceClient();
  const { error } = await db
    .from("newsletter_subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("email", email.toLowerCase());
  return !error;
}
