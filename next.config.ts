import type { NextConfig } from "next";

// URLs from the site before the July 2026 rebuild. Google still crawls them
// (Search Console listed 59 as 404 and 11 more as soft 404 / noindex), so each
// one is sent permanently to the page that replaced it. An old URL with no
// honest equivalent is left to 404 rather than redirected somewhere unrelated.

// Old city slugs that were renamed.
const LEGACY_CITY_SLUGS: Record<string, string> = {
  hannover: "hanover",
  duesseldorf: "dusseldorf",
};

// Old per-city task -> the city step that replaced it.
const LEGACY_CITY_TASKS: Record<string, string> = {
  anmeldung: "anmeldung",
  "residence-permit": "residence-permit",
  "visa-conversion": "residence-permit",
  "work-permit-change": "residence-permit",
  fiktionsbescheinigung: "visa-extension",
};

// Old task with no per-city page -> the Germany-wide page that replaced it.
const LEGACY_TASK_PAGES: Record<string, string> = {
  "health-insurance-provisional": "/guide/health-insurance-from-home",
  "health-insurance": "/guide/activate-health-insurance",
  "qualification-recognition": "/guide/job-contract-recognition",
  "bank-account": "/guide/bank-account",
  rundfunkbeitrag: "/guide/rundfunkbeitrag",
  "tax-id": "/guide/tax-id",
  schufa: "/problems/no-schufa-history",
  "entry-visa": "/guide/national-visa",
  "blocked-account": "/guide/blocked-account",
  "driving-license": "/guide/driving-license",
};

// One-off pages whose slug changed.
const LEGACY_PAGES: Record<string, string> = {
  "/germany": "/cities",
  "/problems/sperrkonto-monthly-limit": "/guide/blocked-account",
  "/problems/slow-qualification-recognition": "/problems/professional-recognition",
  "/problems/kindergeld-for-families": "/letters/kindergeld-familienkasse",
  "/problems/family-reunion-visa": "/guide/bringing-family",
  "/problems/auslaenderbehoerde-not-responding": "/problems/visa-expiring-no-appointment",
  "/problems/expired-fiktionsbescheinigung": "/problems/visa-expiring-no-appointment",
  "/letters/krankenkasse-beitragsbescheid": "/letters/krankenkasse-contribution",
  "/letters/steuer-id-mitteilung": "/letters/steuer-id-letter",
  "/letters/auslaenderbehoerde-document-request": "/letters/auslaenderbehoerde-invitation",
  "/letters/finanzamt-steuernummer": "/letters/fragebogen-steuerliche-erfassung",
};

function legacyRedirects() {
  const rules: { source: string; destination: string }[] = [];

  // Renamed cities first, so they reach the new slug in one hop.
  for (const [oldCity, city] of Object.entries(LEGACY_CITY_SLUGS)) {
    rules.push({ source: `/germany/${oldCity}`, destination: `/cities/${city}` });
    for (const [task, step] of Object.entries(LEGACY_CITY_TASKS)) {
      rules.push({
        source: `/germany/${oldCity}/${task}`,
        destination: `/cities/${city}/${step}`,
      });
    }
    rules.push({
      source: `/germany/${oldCity}/:task`,
      destination: `/cities/${city}`,
    });
  }

  for (const [task, step] of Object.entries(LEGACY_CITY_TASKS)) {
    rules.push({ source: `/germany/:city/${task}`, destination: `/cities/:city/${step}` });
    rules.push({ source: `/tasks/${task}`, destination: `/guide/${step}` });
  }
  for (const [task, page] of Object.entries(LEGACY_TASK_PAGES)) {
    rules.push({ source: `/germany/:city/${task}`, destination: page });
    rules.push({ source: `/tasks/${task}`, destination: page });
  }

  rules.push({ source: "/germany/:city", destination: "/cities/:city" });
  rules.push({ source: "/germany/:city/:task", destination: "/cities/:city" });
  rules.push({ source: "/glossary/:term", destination: "/glossary" });

  for (const [source, destination] of Object.entries(LEGACY_PAGES)) {
    rules.push({ source, destination });
  }

  return rules.map((rule) => ({ ...rule, permanent: true }));
}

const nextConfig: NextConfig = {
  images: {
    // WebP-only: AVIF encoding is dramatically slower for marginal size gains
    // on our photo set, and stalls the dev-mode optimizer at large widths.
    formats: ["image/webp"],
  },
  async redirects() {
    return legacyRedirects();
  },
};

export default nextConfig;
