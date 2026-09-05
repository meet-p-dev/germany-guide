"use server";

import { revalidatePath } from "next/cache";
import { runDigest, sendDigestPreview } from "@/lib/email/digest";
import { getAdminUser } from "@/lib/admin/auth";
// State shapes live outside this file: a "use server" module may only export
// async functions. See the note in newsletter-state.ts.
import type { DigestActionState } from "@/lib/newsletter-state";

/**
 * Send the pending digest to the admin's own address. Changes no state — it
 * neither marks updates as delivered nor touches any subscriber.
 */
export async function sendTestDigestAction(): Promise<DigestActionState> {
  // Server Actions are reachable by direct POST; re-check rather than trusting
  // that the page rendered behind the admin gate.
  const admin = await getAdminUser();
  if (!admin?.email) {
    return { ok: false, message: "Not authorized.", submitted: true };
  }

  const result = await sendDigestPreview(admin.email);
  if (result.status === "skipped") {
    return {
      ok: false,
      message: "Nothing new to send — every update has already gone out.",
      submitted: true,
    };
  }
  return {
    ok: result.status === "sent",
    message:
      result.status === "sent"
        ? `Test digest with ${result.itemCount} item(s) sent to ${admin.email}.`
        : `Could not send: ${result.reason ?? "unknown error"}`,
    submitted: true,
  };
}

/**
 * Send the digest for real, now, instead of waiting for the monthly cron.
 * Same code path as the cron, so a manual send and a scheduled one cannot drift.
 */
export async function sendDigestNowAction(): Promise<DigestActionState> {
  if (!(await getAdminUser())) {
    return { ok: false, message: "Not authorized.", submitted: true };
  }

  const result = await runDigest();
  revalidatePath("/admin/newsletter");

  const messages: Record<string, string> = {
    sent: `Sent to ${result.recipientCount} subscriber(s).`,
    partial: `Sent to ${result.recipientCount}; ${result.remaining} still to go (per-run cap). Run it again to continue.`,
    skipped: result.reason ?? "Nothing to send.",
    failed: `Send failed: ${result.reason ?? "unknown error"}`,
  };

  return {
    ok: result.status === "sent" || result.status === "skipped",
    message: messages[result.status],
    submitted: true,
  };
}
