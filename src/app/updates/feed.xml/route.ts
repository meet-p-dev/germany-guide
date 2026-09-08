import { getUpdates } from "@/lib/content";

const BASE_URL = "https://www.germanyguide.net";

export const revalidate = 3600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Strip the small markdown subset used in update bodies down to plain text. */
function markdownToPlain(md: string): string {
  return md
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  const updates = await getUpdates();

  const items = updates
    .map((update) => {
      const url = `${BASE_URL}/updates#${update.slug}`;
      return `    <item>
      <title>${escapeXml(update.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="false">${update.slug}</guid>
      <pubDate>${new Date(`${update.published_at}T08:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(markdownToPlain(update.body_md))}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Germany Guide: Updates</title>
    <link>${BASE_URL}/updates</link>
    <atom:link href="${BASE_URL}/updates/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Fee changes, new rules and procedure updates that affect international students and workers in Germany.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
