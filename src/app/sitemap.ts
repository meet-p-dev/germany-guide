import type { MetadataRoute } from "next";
import {
  getAllStepSlugs,
  getCities,
  getCityStepPairs,
  getLetters,
  getProblems,
} from "@/lib/content";

const BASE = "https://germanyguide.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [stepSlugs, cities, cityStepPairs, problems, letters] =
    await Promise.all([
      getAllStepSlugs(),
      getCities(),
      getCityStepPairs(),
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
    "/glossary",
  ].map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  return [
    ...staticPages,
    ...stepSlugs.map((slug) => ({
      url: `${BASE}/guide/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...cities
      .filter((city) => city.status === "live")
      .map((city) => ({
        url: `${BASE}/cities/${city.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
    ...cityStepPairs.map(({ city, step }) => ({
      url: `${BASE}/cities/${city}/${step}`,
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
