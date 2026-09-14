import type { MetadataRoute } from "next";
import {
  getCities,
  getCityFactUpdatedDates,
  getCityStepPairs,
  getLetters,
  getProblems,
  getStepUpdatedDates,
} from "@/lib/content";

const BASE = "https://www.germanyguide.net";

// <lastmod> is set only where the database records a real edit date
// (`updated_at`, maintained by triggers on steps, city_steps and city_facts).
// Pages without one get no lastmod rather than an invented date: Google stops
// trusting a site's lastmod values once it finds inaccurate ones.
const latest = (dates: (string | null | undefined)[]) =>
  dates.filter((d): d is string => Boolean(d)).sort().at(-1);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [steps, cities, cityStepPairs, cityFacts, problems, letters] =
    await Promise.all([
      getStepUpdatedDates(),
      getCities(),
      getCityStepPairs(),
      getCityFactUpdatedDates(),
      getProblems(),
      getLetters(),
    ]);

  const staticPages: MetadataRoute.Sitemap = [
    "",
    "/process",
    "/plan",
    "/journey",
    "/cities",
    "/problems",
    "/letters",
    "/updates",
    "/glossary",
    "/costs",
    "/why-germany",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  return [
    ...staticPages,
    ...steps.map((step) => ({
      url: `${BASE}/guide/${step.slug}`,
      lastModified: step.updated_at ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...cities
      .filter((city) => city.status === "live")
      .map((city) => ({
        url: `${BASE}/cities/${city.slug}`,
        // A city hub shows its steps and its facts, so it changes when either does.
        lastModified: latest([
          ...cityStepPairs.filter((p) => p.city === city.slug).map((p) => p.updatedAt),
          ...cityFacts.filter((f) => f.city === city.slug).map((f) => f.updatedAt),
        ]),
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ...cityStepPairs.map(({ city, step, updatedAt }) => ({
      url: `${BASE}/cities/${city}/${step}`,
      lastModified: updatedAt ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...problems.map((problem) => ({
      url: `${BASE}/problems/${problem.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...letters.map((letter) => ({
      url: `${BASE}/letters/${letter.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
