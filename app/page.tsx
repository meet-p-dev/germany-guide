import { getStatesWithCities } from "@/lib/queries/guide";
import { Landing, type FeaturedCity } from "@/components/Landing";

export const revalidate = 3600;

// Six flagship cities shown on the landing grid, in display order. Names +
// state + published status come from the DB; the tagline is neutral marketing
// copy (not a bureaucratic fact). Cities have no photo column yet, so the grid
// uses on-brand gradient tiles — swap to real images later via a DB column.
const FEATURED: { slug: string; tagline: string }[] = [
  { slug: "berlin", tagline: "The capital — big-city pace, scarce slots." },
  { slug: "munich", tagline: "Bavaria's orderly heart on the Isar." },
  { slug: "hamburg", tagline: "The northern port city." },
  { slug: "cologne", tagline: "The Rhineland's easygoing metropolis." },
  { slug: "frankfurt", tagline: "Germany's finance hub on the Main." },
  { slug: "stuttgart", tagline: "The Swabian engineering capital." },
];

export default async function HomePage() {
  const states = await getStatesWithCities();

  // Flatten published cities to a slug-keyed lookup so we can resolve the
  // featured list to real names + state labels (and drop any not published).
  const bySlug = new Map<string, { name: string; state: string }>();
  for (const state of states) {
    for (const city of state.cities) {
      if (city.is_published) {
        bySlug.set(city.slug, { name: city.name_en, state: state.name_en });
      }
    }
  }

  const featuredCities: FeaturedCity[] = FEATURED.flatMap((f) => {
    const city = bySlug.get(f.slug);
    return city
      ? [{ slug: f.slug, name: city.name, state: city.state, tagline: f.tagline }]
      : [];
  });

  return <Landing featuredCities={featuredCities} />;
}
