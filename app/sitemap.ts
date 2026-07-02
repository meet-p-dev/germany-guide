import type { MetadataRoute } from "next";
import { getStatesWithCities, getTasksByCategory } from "@/lib/queries/guide";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [states, categories] = await Promise.all([
    getStatesWithCities(),
    getTasksByCategory(),
  ]);

  const cities = states.flatMap((s) => s.cities.filter((c) => c.is_published));
  const tasks = categories.flatMap((c) => c.tasks);

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/germany`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/problems`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/letters`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/glossary`, changeFrequency: "monthly", priority: 0.5 },
    ...tasks.map((t) => ({
      url: `${base}/tasks/${t.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...cities.map((c) => ({
      url: `${base}/germany/${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...cities.flatMap((c) =>
      tasks.map((t) => ({
        url: `${base}/germany/${c.slug}/${t.slug}`,
        changeFrequency: "monthly" as const,
        priority: 0.9,
      }))
    ),
  ];
}
