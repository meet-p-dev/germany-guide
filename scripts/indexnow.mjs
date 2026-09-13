#!/usr/bin/env node
// Sends every URL in the live sitemap to IndexNow, which passes it on to Bing,
// Yandex, Seznam, Naver and the other engines that share the protocol. Google
// does not use IndexNow; for Google, the sitemap in Search Console does this job.
//
// The key is not a secret: IndexNow proves ownership by fetching the key file
// from the site itself (public/<key>.txt). The file must be live before a
// submission, so deploy first, then run:
//
//   npm run seo:indexnow                 (submit every sitemap URL)
//   npm run seo:indexnow -- --dry-run    (show what would be sent)
//
// Re-run after adding or changing pages. Submitting unchanged pages again and
// again is discouraged by the protocol, so do not put this on a tight schedule.

import { readdir } from "node:fs/promises";

const SITE = "https://www.germanyguide.net";
const HOST = new URL(SITE).host;
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function indexNowKey() {
  const files = await readdir("public");
  const keyFile = files.find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (!keyFile) throw new Error("No IndexNow key file (32 hex chars .txt) in public/.");
  return keyFile.replace(/\.txt$/, "");
}

async function main() {
  const key = await indexNowKey();
  const keyLocation = `${SITE}/${key}.txt`;

  const live = await fetch(keyLocation);
  if (!live.ok || (await live.text()).trim() !== key) {
    throw new Error(`${keyLocation} is not live yet (HTTP ${live.status}). Deploy first.`);
  }

  const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
  const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  console.log(`${urlList.length} URLs from the sitemap, key file live at ${keyLocation}`);
  if (process.argv.includes("--dry-run")) return;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: HOST, key, keyLocation, urlList }),
  });
  // 200 = accepted, 202 = accepted and the key is still being checked.
  const meaning = {
    200: "accepted",
    202: "accepted, key check pending",
    400: "bad request",
    403: "key not valid (file missing or wrong content)",
    422: "URLs do not belong to the host, or key mismatch",
    429: "too many requests, try again later",
  };
  console.log(`IndexNow answered ${res.status}: ${meaning[res.status] ?? (await res.text())}`);
  if (res.status >= 300) process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
