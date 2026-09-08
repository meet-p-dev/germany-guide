/**
 * Email HTML for the two messages we send: the double opt-in confirmation and
 * the monthly digest.
 *
 * Constraints that shape this file:
 * - **Tables and inline styles only.** Email clients (Outlook above all) do not
 *   run a modern layout engine. No flexbox, no grid, no external stylesheet.
 * - **No emojis** — the project rule applies to email as much as to the site.
 * - **Light colours only.** Many clients ignore `prefers-color-scheme`, and a
 *   half-applied dark theme looks broken, so the palette is the light one.
 * - **Every commercial email carries sender identification and a one-click
 *   unsubscribe** (UWG section 7 / GDPR Art. 21). That is not decoration; the
 *   footer builder is shared so no template can forget it.
 */

const BASE_URL = "https://www.germanyguide.net";

const COLORS = {
  background: "#faf9f4",
  card: "#ffffff",
  foreground: "#1f1b19",
  muted: "#6d655e",
  border: "#e7e3d8",
  primary: "#b42233",
  flagBlack: "#1a1a1a",
  flagRed: "#dd0000",
  flagGold: "#ffce00",
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

/** Postal address for the sender identification required on commercial email. */
const IMPRESSUM_LINE =
  "Germany Guide &middot; Meet Patel &middot; M&uuml;nchener Str. 67, 85051 Ingolstadt, Deutschland";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip the small markdown subset used in update bodies down to plain text. */
export function markdownToPlain(md: string): string {
  return md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** First sentence or so, for the digest teaser. */
function teaser(md: string, max = 220): string {
  const plain = markdownToPlain(md);
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("; "));
  return lastStop > 120 ? cut.slice(0, lastStop + 1) : `${cut.trimEnd()}...`;
}

function shell({
  title,
  bodyHtml,
  footerHtml,
}: {
  title: string;
  bodyHtml: string;
  footerHtml: string;
}): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLORS.background};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.background};">
<tr><td align="center" style="padding:0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
    <tr>
      <td style="height:4px;line-height:4px;font-size:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="33.33%" style="background:${COLORS.flagBlack};height:4px;line-height:4px;font-size:0;">&nbsp;</td>
          <td width="33.33%" style="background:${COLORS.flagRed};height:4px;line-height:4px;font-size:0;">&nbsp;</td>
          <td width="33.34%" style="background:${COLORS.flagGold};height:4px;line-height:4px;font-size:0;">&nbsp;</td>
        </tr></table>
      </td>
    </tr>
    <tr><td style="padding:28px 24px 8px 24px;font-family:${FONT_STACK};">
      <a href="${BASE_URL}" style="color:${COLORS.foreground};text-decoration:none;font-size:17px;font-weight:700;letter-spacing:-0.01em;">Germany&nbsp;Guide</a>
    </td></tr>
    <tr><td style="padding:0 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLORS.card};border:1px solid ${COLORS.border};border-radius:14px;">
        <tr><td style="padding:28px 24px;font-family:${FONT_STACK};color:${COLORS.foreground};font-size:15px;line-height:1.65;">
${bodyHtml}
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="padding:20px 24px 36px 24px;font-family:${FONT_STACK};color:${COLORS.muted};font-size:12px;line-height:1.6;">
${footerHtml}
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;"><tr>
  <td style="background:${COLORS.primary};border-radius:999px;">
    <a href="${href}" style="display:inline-block;padding:13px 28px;font-family:${FONT_STACK};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
  </td>
</tr></table>`;
}

// ---------------------------------------------------------------------------
// Confirmation (double opt-in)
// ---------------------------------------------------------------------------

export function confirmationEmail(confirmUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "Confirm your Germany Guide updates";

  const html = shell({
    title: subject,
    bodyHtml: `
<p style="margin:0 0 14px 0;font-size:19px;font-weight:700;letter-spacing:-0.01em;">One click and you are subscribed</p>
<p style="margin:0 0 4px 0;">Someone — we hope you — asked for the Germany Guide update email at this address. Confirm below and you will get a short monthly note when fees, rules or city procedures change.</p>
${button(confirmUrl, "Confirm my subscription")}
<p style="margin:0 0 14px 0;color:${COLORS.muted};font-size:13px;">If the button does not work, paste this into your browser:<br>
<span style="word-break:break-all;color:${COLORS.primary};">${escapeHtml(confirmUrl)}</span></p>
<p style="margin:0;color:${COLORS.muted};font-size:13px;">If this was not you, ignore this email. Nothing is stored as a subscription until you confirm, and we will not write to you again.</p>`,
    footerHtml: `<p style="margin:0 0 6px 0;">${IMPRESSUM_LINE}</p>
<p style="margin:0;"><a href="${BASE_URL}/impressum" style="color:${COLORS.muted};">Impressum</a> &middot; <a href="${BASE_URL}/privacy" style="color:${COLORS.muted};">Privacy</a></p>`,
  });

  const text = `One click and you are subscribed

Someone — we hope you — asked for the Germany Guide update email at this address. Confirm to get a short monthly note when fees, rules or city procedures change:

${confirmUrl}

If this was not you, ignore this email. Nothing is stored as a subscription until you confirm.

Germany Guide - Meet Patel, Muenchener Str. 67, 85051 Ingolstadt, Deutschland
${BASE_URL}/impressum`;

  return { subject, html, text };
}

// ---------------------------------------------------------------------------
// Monthly digest
// ---------------------------------------------------------------------------

export interface DigestItem {
  slug: string;
  title: string;
  body_md: string;
  category: string;
  source_name: string | null;
}

const CATEGORY_LABEL: Record<string, string> = {
  money: "Money",
  transport: "Transport",
  visa: "Visa",
  study: "Study",
  work: "Work",
  guide: "The guide",
};

export function digestEmail({
  items,
  unsubscribeUrl,
}: {
  items: DigestItem[];
  unsubscribeUrl: string;
}): { subject: string; html: string; text: string } {
  const subject =
    items.length === 1
      ? items[0].title
      : `${items.length} things that changed for internationals in Germany`;

  const itemsHtml = items
    .map((item, index) => {
      const url = `${BASE_URL}/updates#${item.slug}`;
      const label = CATEGORY_LABEL[item.category] ?? "Update";
      const divider =
        index === 0
          ? ""
          : `<tr><td style="padding:22px 0 0 0;"><div style="height:1px;background:${COLORS.border};line-height:1px;font-size:0;">&nbsp;</div></td></tr>`;
      return `${divider}
<tr><td style="padding:${index === 0 ? "0" : "22px"} 0 0 0;font-family:${FONT_STACK};">
  <p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.muted};">${escapeHtml(label)}</p>
  <p style="margin:0 0 8px 0;font-size:17px;font-weight:700;line-height:1.35;letter-spacing:-0.01em;">
    <a href="${url}" style="color:${COLORS.foreground};text-decoration:none;">${escapeHtml(item.title)}</a>
  </p>
  <p style="margin:0 0 10px 0;font-size:14px;line-height:1.6;color:${COLORS.foreground};">${escapeHtml(teaser(item.body_md))}</p>
  <p style="margin:0;font-size:14px;"><a href="${url}" style="color:${COLORS.primary};font-weight:600;text-decoration:none;">Read the detail</a>${
    item.source_name
      ? `<span style="color:${COLORS.muted};"> &middot; source: ${escapeHtml(item.source_name)}</span>`
      : ""
  }</p>
</td></tr>`;
    })
    .join("\n");

  const html = shell({
    title: subject,
    bodyHtml: `
<p style="margin:0 0 6px 0;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${COLORS.muted};">What changed</p>
<p style="margin:0 0 20px 0;font-size:19px;font-weight:700;letter-spacing:-0.01em;">${escapeHtml(subject)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${itemsHtml}
</table>
<div style="height:1px;background:${COLORS.border};line-height:1px;font-size:0;margin:24px 0;">&nbsp;</div>
<p style="margin:0;font-size:13px;color:${COLORS.muted};">Every figure on the site carries a last-verified date and links to the official source. This is general information, not legal advice — always check the authority's own page before you act.</p>`,
    footerHtml: `<p style="margin:0 0 6px 0;">You are getting this because you confirmed your subscription at germanyguide.net. <a href="${unsubscribeUrl}" style="color:${COLORS.muted};text-decoration:underline;">Unsubscribe</a> at any time.</p>
<p style="margin:0 0 6px 0;">${IMPRESSUM_LINE}</p>
<p style="margin:0;"><a href="${BASE_URL}/impressum" style="color:${COLORS.muted};">Impressum</a> &middot; <a href="${BASE_URL}/privacy" style="color:${COLORS.muted};">Privacy</a> &middot; <a href="${BASE_URL}/updates" style="color:${COLORS.muted};">All updates</a></p>`,
  });

  const textItems = items
    .map(
      (item) =>
        `* ${item.title}\n  ${teaser(item.body_md)}\n  ${BASE_URL}/updates#${item.slug}`,
    )
    .join("\n\n");

  const text = `${subject}

${textItems}

---
This is general information, not legal advice. Always check the authority's own page before you act.

You are getting this because you confirmed your subscription at germanyguide.net.
Unsubscribe: ${unsubscribeUrl}

Germany Guide - Meet Patel, Muenchener Str. 67, 85051 Ingolstadt, Deutschland
${BASE_URL}/impressum`;

  return { subject, html, text };
}
