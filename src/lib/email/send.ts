/**
 * Outbound email via Resend's REST API.
 *
 * Deliberately a plain `fetch` rather than the SDK: one endpoint, one shape, no
 * dependency to keep in step with the rest of the stack.
 *
 * DNS note (matters more than it looks): the root domain's MX records point at
 * iCloud for the team@/kontakt@ mailboxes. The *sending* domain is therefore a
 * subdomain — `send.germanyguide.net` — whose SPF/DKIM records cannot collide
 * with those mailboxes. Replies are steered back to the real inbox with
 * Reply-To, so a reader answering the newsletter still reaches a human.
 */

const RESEND_URL = "https://api.resend.com/emails";

/** Visible sender. Must be on the domain verified in Resend. */
const FROM = process.env.NEWSLETTER_FROM ?? "Germany Guide <team@send.germanyguide.net>";
/** Where replies land — a real mailbox, not the sending subdomain. */
const REPLY_TO = process.env.NEWSLETTER_REPLY_TO ?? "team@germanyguide.net";

export interface SendResult {
  ok: boolean;
  /** Resend's message id, when it accepted the message. */
  id?: string;
  error?: string;
}

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  headers,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Extra headers — List-Unsubscribe for digests, for example. */
  headers?: Record<string, string>;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY is not set." };
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        reply_to: REPLY_TO,
        subject,
        html,
        text,
        ...(headers ? { headers } : {}),
      }),
    });

    if (!response.ok) {
      // Resend returns a JSON error body; fall back to the status if it doesn't.
      const detail = await response.text();
      return {
        ok: false,
        error: `Resend responded ${response.status}: ${detail.slice(0, 300)}`,
      };
    }

    const data: unknown = await response.json();
    const id =
      typeof data === "object" && data !== null && "id" in data
        ? String((data as { id: unknown }).id)
        : undefined;
    return { ok: true, id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown send failure.",
    };
  }
}
