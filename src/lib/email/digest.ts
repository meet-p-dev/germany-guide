import { digestEmail, type DigestItem } from "@/lib/email/templates";
import { emailConfigured, sendEmail } from "@/lib/email/send";
import { unsubscribeUrl } from "@/lib/newsletter";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/service-client";

/**
 * The monthly digest run, shared by the cron route and the admin "send a test"
 * button.
 *
 * Two constraints drive the shape of this file:
 *
 * 1. **Nothing goes out twice.** An update counts as delivered only once a run
 *    completes (`status = 'sent'`). A run that hit the provider's cap is logged
 *    as `partial`, which leaves its updates eligible so the rest of the list is
 *    reached on the next run.
 * 2. **The free provider tier has a daily cap** (Resend: 100/day). We send at
 *    most `NEWSLETTER_MAX_PER_RUN`, oldest-contacted first, and never re-mail
 *    anyone contacted in the last week — so a partial run resumes cleanly
 *    instead of double-sending to the people it already reached.
 */

/** Stay under the free tier's 100/day with room for auth mail. */
const MAX_PER_RUN = Number(process.env.NEWSLETTER_MAX_PER_RUN ?? 90);

/** Nobody gets two digests inside this window, even across a resumed run. */
const MIN_GAP_DAYS = 7;

export interface DigestRunResult {
  status: "sent" | "partial" | "skipped" | "failed";
  reason?: string;
  itemCount: number;
  recipientCount: number;
  failedCount: number;
  remaining: number;
  subject?: string;
}

/** Updates not yet covered by a completed send. */
export async function pendingDigestItems(): Promise<DigestItem[]> {
  const db = createServiceClient();

  const [{ data: updates }, { data: sends }] = await Promise.all([
    db
      .from("updates")
      .select("slug, title, body_md, category, source_name, published_at")
      .order("published_at", { ascending: false }),
    db.from("newsletter_sends").select("update_slugs").eq("status", "sent"),
  ]);

  const delivered = new Set<string>(
    (sends ?? []).flatMap((row) => row.update_slugs ?? []),
  );

  return (updates ?? [])
    .filter((update) => !delivered.has(update.slug))
    .map(({ slug, title, body_md, category, source_name }) => ({
      slug,
      title,
      body_md,
      category,
      source_name,
    }));
}

export async function runDigest(): Promise<DigestRunResult> {
  if (!hasServiceRole() || !emailConfigured()) {
    return {
      status: "failed",
      reason: "RESEND_API_KEY or SUPABASE_SERVICE_ROLE_KEY is not set.",
      itemCount: 0,
      recipientCount: 0,
      failedCount: 0,
      remaining: 0,
    };
  }

  const db = createServiceClient();
  const items = await pendingDigestItems();

  if (items.length === 0) {
    await db.from("newsletter_sends").insert({
      subject: "No new updates",
      status: "skipped",
      update_slugs: [],
      recipient_count: 0,
    });
    return {
      status: "skipped",
      reason: "Nothing new since the last digest.",
      itemCount: 0,
      recipientCount: 0,
      failedCount: 0,
      remaining: 0,
    };
  }

  const gapCutoff = new Date(
    Date.now() - MIN_GAP_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  // Everyone eligible, so we can tell whether the cap left people out.
  const { data: eligible, error: recipientError } = await db
    .from("newsletter_subscribers")
    .select("id, email, unsubscribe_token, last_sent_at")
    .eq("status", "confirmed")
    .or(`last_sent_at.is.null,last_sent_at.lt.${gapCutoff}`)
    .order("last_sent_at", { ascending: true, nullsFirst: true });

  if (recipientError) {
    return {
      status: "failed",
      reason: recipientError.message,
      itemCount: items.length,
      recipientCount: 0,
      failedCount: 0,
      remaining: 0,
    };
  }

  const all = eligible ?? [];
  if (all.length === 0) {
    return {
      status: "skipped",
      reason: "No confirmed subscribers are due a digest.",
      itemCount: items.length,
      recipientCount: 0,
      failedCount: 0,
      remaining: 0,
    };
  }

  const batch = all.slice(0, MAX_PER_RUN);
  const remaining = all.length - batch.length;

  let sentCount = 0;
  let failedCount = 0;
  let lastError: string | undefined;

  for (const recipient of batch) {
    const url = unsubscribeUrl(recipient.unsubscribe_token);
    const { subject, html, text } = digestEmail({
      items,
      unsubscribeUrl: url,
    });

    const result = await sendEmail({
      to: recipient.email,
      subject,
      html,
      text,
      headers: {
        // The provider-rendered unsubscribe button posts to the API route.
        "List-Unsubscribe": `<https://germanyguide.net/api/newsletter/unsubscribe?token=${recipient.unsubscribe_token}>, <mailto:team@germanyguide.net?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    });

    if (result.ok) {
      sentCount += 1;
      await db
        .from("newsletter_subscribers")
        .update({ last_sent_at: new Date().toISOString() })
        .eq("id", recipient.id);
    } else {
      failedCount += 1;
      lastError = result.error;
    }
  }

  const complete = remaining === 0 && failedCount === 0;
  const status: DigestRunResult["status"] =
    sentCount === 0 ? "failed" : complete ? "sent" : "partial";

  const { subject } = digestEmail({ items, unsubscribeUrl: "" });

  await db.from("newsletter_sends").insert({
    subject,
    // Only a completed run retires these slugs; a partial run leaves them
    // eligible so the people it could not reach still get them.
    update_slugs: status === "sent" ? items.map((item) => item.slug) : [],
    recipient_count: sentCount,
    failed_count: failedCount,
    status,
    error:
      remaining > 0
        ? `${remaining} subscriber(s) not reached this run (per-run cap ${MAX_PER_RUN}). Re-run to continue.`
        : (lastError ?? null),
  });

  return {
    status,
    reason: lastError,
    itemCount: items.length,
    recipientCount: sentCount,
    failedCount,
    remaining,
    subject,
  };
}

/** Send the pending digest to one address only, without touching any state. */
export async function sendDigestPreview(to: string): Promise<DigestRunResult> {
  if (!emailConfigured() || !hasServiceRole()) {
    return {
      status: "failed",
      reason: "RESEND_API_KEY or SUPABASE_SERVICE_ROLE_KEY is not set.",
      itemCount: 0,
      recipientCount: 0,
      failedCount: 0,
      remaining: 0,
    };
  }

  const items = await pendingDigestItems();
  if (items.length === 0) {
    return {
      status: "skipped",
      reason: "Nothing new to preview.",
      itemCount: 0,
      recipientCount: 0,
      failedCount: 0,
      remaining: 0,
    };
  }

  const { subject, html, text } = digestEmail({
    items,
    unsubscribeUrl: "https://germanyguide.net/newsletter/unsubscribe?token=preview",
  });

  const result = await sendEmail({
    to,
    subject: `[Test] ${subject}`,
    html,
    text,
  });

  return {
    status: result.ok ? "sent" : "failed",
    reason: result.error,
    itemCount: items.length,
    recipientCount: result.ok ? 1 : 0,
    failedCount: result.ok ? 0 : 1,
    remaining: 0,
    subject,
  };
}
