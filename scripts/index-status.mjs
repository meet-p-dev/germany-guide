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
// Where the owner keeps the key (docs/automation.md); GSC_KEY_FILE overrides.
const DEFAULT_KEY_FILE = "~/.config/germany-guide/gsc-service-account.json";
const HISTORY_FILE = "reports/index-history.csv";
// Node's fetch has no overall deadline, so one stalled Google response once
// hung a scheduled run indefinitely. Every request now gets one.
const REQUEST_TIMEOUT_MS = 30_000;
const fetchWithTimeout = (url, init = {}) =>
  fetch(url, { ...init, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

async function sitemapUrls() {
  const res = await fetchWithTimeout(`${SITE}/sitemap.xml`);
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

  const res = await fetchWithTimeout("https://oauth2.googleapis.com/token", {
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

async function inspectOnce(url, token) {
  const res = await fetchWithTimeout(INSPECT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: PROPERTY, languageCode: "en-US" }),
  });
  return { res, body: await res.json() };
}

// One retry for a timeout, network error or Google 5xx; after that the URL
// becomes an error row, so a run always finishes.
async function inspect(url, token) {
  let res;
  let body;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      ({ res, body } = await inspectOnce(url, token));
      if (res.status < 500) break;
    } catch (err) {
      if (attempt === 2) {
        const reason = err.name === "TimeoutError" ? "timed out after 30s" : err.message;
        return { url, error: `request failed: ${reason}` };
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
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

// Reads a report written by this script back into { url: coverage }.
function parseReport(csv) {
  const map = new Map();
  for (const line of csv.split("\n").slice(1)) {
    const cells = line.match(/"((?:[^"]|"")*)"/g)?.map((c) => c.slice(1, -1).replaceAll('""', '"'));
    if (cells?.length >= 3) map.set(cells[0], cells[2]);
  }
  return map;
}

const bucket = (coverage) =>
  /indexed/i.test(coverage) && !/not indexed/i.test(coverage)
    ? "indexed"
    : /^Crawled/i.test(coverage)
      ? "crawled"
      : /^Discovered/i.test(coverage)
        ? "discovered"
        : /unknown/i.test(coverage)
          ? "unknown"
          : "other";

// Appends one line per full run to reports/index-history.csv and prints what
// moved since the previous full report, so a scheduled run can say "3 more
// pages indexed since Tuesday" instead of repeating totals.
async function recordHistory(rows, date, file) {
  const totals = { indexed: 0, crawled: 0, discovered: 0, unknown: 0, other: 0 };
  for (const r of rows) totals[bucket(r.coverage)] += 1;

  let history = "";
  try {
    history = await readFile(HISTORY_FILE, "utf8");
  } catch {
    history = "date,total,indexed,crawled,discovered,unknown,other\n";
  }
  const previousLine = history.trim().split("\n").slice(1).filter((l) => !l.startsWith(date)).at(-1);
  const line = [date, rows.length, totals.indexed, totals.crawled, totals.discovered, totals.unknown, totals.other].join(",");
  const kept = history.trim().split("\n").filter((l) => !l.startsWith(`${date},`));
  await writeFile(HISTORY_FILE, `${[...kept, line].join("\n")}\n`);

  console.log(`\nTotals: ${Object.entries(totals).map(([k, v]) => `${k} ${v}`).join(", ")}`);
  if (!previousLine) {
    console.log("No earlier full run to compare with.");
    return;
  }
  const previousDate = previousLine.split(",")[0];
  let previous;
  try {
    previous = parseReport(await readFile(`reports/index-status-${previousDate}.csv`, "utf8"));
  } catch {
    console.log(`Earlier report for ${previousDate} is missing; totals only.`);
    return;
  }
  const [, , ...oldCounts] = previousLine.split(",").map(Number);
  const names = ["indexed", "crawled", "discovered", "unknown", "other"];
  console.log(
    `Since ${previousDate}: ${names.map((n, i) => `${n} ${totals[n] - oldCounts[i] >= 0 ? "+" : ""}${totals[n] - oldCounts[i]}`).join(", ")}`,
  );

  const order = { unknown: 0, other: 0, discovered: 1, crawled: 2, indexed: 3 };
  const moved = rows
    .map((r) => ({ url: r.url, from: bucket(previous.get(r.url) ?? ""), to: bucket(r.coverage) }))
    .filter((m) => previous.has(m.url) && m.from !== m.to);
  const up = moved.filter((m) => order[m.to] > order[m.from]);
  const down = moved.filter((m) => order[m.to] < order[m.from]);
  if (up.length) {
    console.log(`\nMoved forward (${up.length}):`);
    for (const m of up) console.log(`  ${m.from} -> ${m.to}  ${m.url}`);
  }
  if (down.length) {
    console.log(`\nMoved BACK (${down.length}), look at these:`);
    for (const m of down) console.log(`  ${m.from} -> ${m.to}  ${m.url}`);
  }
  if (!up.length && !down.length) console.log("No page changed state.");
  console.log(`History: ${HISTORY_FILE} (this run: ${file})`);
}

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

  const keyFile = (process.env.GSC_KEY_FILE ?? DEFAULT_KEY_FILE).replace(/^~/, homedir());
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
  if (!partial) await recordHistory(rows, date, file);
  console.log(`\nFull table: ${file}`);
}

main().catch((err) => {
  console.error(`\n${err.message}`);
  process.exit(1);
});
