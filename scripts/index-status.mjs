#!/usr/bin/env node
// Asks Google, page by page, whether every URL in the live sitemap is indexed.
//
// Uses the Search Console URL Inspection API: read-only, 2,000 checks a day and
// 600 a minute per property, so all ~270 pages take a few minutes. It cannot
// request indexing; it only reports what Google has.
//
// Setup (once, by the owner, see docs/automation.md):
//   1. A Google Cloud service account with the Search Console API enabled.
//   2. Its JSON key saved OUTSIDE the repo.
//   3. The service account's email added in Search Console > Settings >
//      Users and permissions, as a Restricted user on sc-domain:germanyguide.net.
//
// Run:
//   GSC_KEY_FILE=~/.config/germany-guide/gsc-service-account.json npm run seo:index-status
//   npm run seo:index-status -- --dry-run      (reads the sitemap, calls nothing)
//   npm run seo:index-status -- --limit 10     (first 10 URLs only)
//   npm run seo:index-status -- --only /cities/munich
//
// Writes reports/index-status-<date>.csv and prints a summary.

import { createSign } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";

const SITE = "https://www.germanyguide.net";
const PROPERTY = "sc-domain:germanyguide.net";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const INSPECT_URL =
  "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const CONCURRENCY = 4; // well under the 600-per-minute limit

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

async function sitemapUrls() {
  const res = await fetch(`${SITE}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const base64url = (input) => Buffer.from(input).toString("base64url");

// Service-account OAuth: sign a JWT with the key, swap it for an access token.
async function accessToken(keyFile) {
  const key = JSON.parse(await readFile(keyFile, "utf8"));
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      iss: key.client_email,
      scope: SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const signature = signer.sign(key.private_key).toString("base64url");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claims}.${signature}`,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`token request failed: ${body.error_description ?? body.error}`);
  }
  return body.access_token;
}

async function inspect(url, token) {
  const res = await fetch(INSPECT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: PROPERTY, languageCode: "en-US" }),
  });
  const body = await res.json();
  if (!res.ok) {
    return { url, error: `${res.status} ${body.error?.message ?? ""}`.trim() };
  }
  const r = body.inspectionResult?.indexStatusResult ?? {};
  return {
    url,
    verdict: r.verdict ?? "",
    coverage: r.coverageState ?? "",
    indexing: r.indexingState ?? "",
    fetch: r.pageFetchState ?? "",
    robots: r.robotsTxtState ?? "",
    lastCrawl: r.lastCrawlTime ?? "",
    googleCanonical: r.googleCanonical ?? "",
    userCanonical: r.userCanonical ?? "",
  };
}

async function inBatches(items, size, fn) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
    process.stdout.write(`\r  checked ${Math.min(i + size, items.length)}/${items.length}`);
  }
  process.stdout.write("\n");
  return out;
}

const csvCell = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;

async function main() {
  // --url <address> (repeatable) inspects exactly those addresses instead of
  // the sitemap, e.g. the old no-www versions during the move to www.
  const explicit = args.flatMap((a, i) => (a === "--url" && args[i + 1] ? [args[i + 1]] : []));
  let urls = explicit.length ? explicit : await sitemapUrls();
  const only = option("--only");
  if (only) urls = urls.filter((u) => u.startsWith(`${SITE}${only}`));
  const limit = Number(option("--limit"));
  if (limit > 0) urls = urls.slice(0, limit);

  console.log(`${urls.length} URLs from ${SITE}/sitemap.xml`);
  const offHost = urls.filter((u) => !u.startsWith(`${SITE}/`) && u !== SITE);
  if (offHost.length) console.log(`  WARNING: ${offHost.length} sitemap URLs are not on ${SITE}`);
  if (flag("--dry-run")) return;

  const keyFile = (process.env.GSC_KEY_FILE ?? "").replace(/^~/, homedir());
  if (!keyFile) {
    throw new Error("Set GSC_KEY_FILE to the service account's JSON key (kept outside the repo).");
  }
  const token = await accessToken(keyFile);
  const rows = await inBatches(urls, CONCURRENCY, (u) => inspect(u, token));

  const columns = ["url", "verdict", "coverage", "indexing", "fetch", "robots", "lastCrawl", "googleCanonical", "userCanonical", "error"];
  const date = new Date().toISOString().slice(0, 10);
  await mkdir("reports", { recursive: true });
  // A partial run gets its own file so it never overwrites the day's full report.
  const partial = explicit.length > 0 || Boolean(only) || limit > 0;
  const file = `reports/index-status-${date}${partial ? "-partial" : ""}.csv`;
  await writeFile(
    file,
    [columns.join(","), ...rows.map((r) => columns.map((c) => csvCell(r[c])).join(","))].join("\n"),
  );

  const count = (key) =>
    Object.entries(
      rows.reduce((acc, r) => ({ ...acc, [r[key] || "(none)"]: (acc[r[key] || "(none)"] ?? 0) + 1 }), {}),
    ).sort((a, b) => b[1] - a[1]);

  const indexed = rows.filter((r) => r.verdict === "PASS").length;
  console.log(`\nIndexed: ${indexed} of ${rows.length}`);
  console.log("\nBy coverage state:");
  for (const [state, n] of count("coverage")) console.log(`  ${String(n).padStart(4)}  ${state}`);

  // Google picked a different page as the "main" one: worth a look.
  const canonicalMismatch = rows.filter(
    (r) => r.googleCanonical && r.googleCanonical.replace(/\/$/, "") !== r.url.replace(/\/$/, ""),
  );
  if (canonicalMismatch.length) {
    console.log(`\nGoogle chose a different canonical for ${canonicalMismatch.length}:`);
    for (const r of canonicalMismatch.slice(0, 20)) console.log(`  ${r.url}\n    -> ${r.googleCanonical}`);
  }
  const errors = rows.filter((r) => r.error);
  if (errors.length) {
    console.log(`\n${errors.length} requests failed, first: ${errors[0].url} ${errors[0].error}`);
  }
  console.log(`\nFull table: ${file}`);
}

main().catch((err) => {
  console.error(`\n${err.message}`);
  process.exit(1);
});
