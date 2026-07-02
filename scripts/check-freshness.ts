/**
 * Flag published content that needs re-verification:
 *   - last_verified_at older than 120 days (or never set)
 *   - source URLs that no longer resolve
 *
 *   npx tsx scripts/check-freshness.ts
 */
import { serviceClient } from "./lib";

const STALE_DAYS = 120;

async function main() {
  const db = serviceClient();
  const cutoff = new Date(Date.now() - STALE_DAYS * 86400_000)
    .toISOString()
    .slice(0, 10);

  const tables = ["guides", "city_task_variants", "problems", "letters"] as const;
  let staleCount = 0;
  const urls = new Set<string>();

  for (const table of tables) {
    const { data } = await db
      .from(table)
      .select("id, last_verified_at, sources")
      .eq("status", "published");
    for (const row of data ?? []) {
      if (!row.last_verified_at || row.last_verified_at < cutoff) {
        staleCount++;
        console.log(
          `STALE  ${table} ${row.id}  last_verified=${row.last_verified_at ?? "never"}`
        );
      }
      if (Array.isArray(row.sources)) {
        for (const s of row.sources as { url?: string }[]) {
          if (s.url) urls.add(s.url);
        }
      }
    }
  }

  console.log(`\nChecking ${urls.size} distinct source URLs…`);
  let deadCount = 0;
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: "HEAD", redirect: "follow" });
      if (res.status >= 400) {
        deadCount++;
        console.log(`DEAD   ${res.status}  ${url}`);
      }
    } catch {
      deadCount++;
      console.log(`DEAD   (network)  ${url}`);
    }
  }

  console.log(`\n${staleCount} stale row(s), ${deadCount} dead source URL(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
