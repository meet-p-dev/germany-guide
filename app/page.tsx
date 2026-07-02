import Link from "next/link";
import { Briefcase, GraduationCap, Globe, HandHeart } from "lucide-react";
import { CityPicker } from "@/components/CityPicker";
import { getStatesWithCities, getTasksByCategory } from "@/lib/queries/guide";

export const revalidate = 3600;

const AUDIENCES = [
  { key: "student", label: "Student", icon: GraduationCap },
  { key: "worker", label: "Skilled worker", icon: Briefcase },
  { key: "refugee", label: "Refugee", icon: HandHeart },
  { key: "eu", label: "EU citizen", icon: Globe },
];

export default async function HomePage() {
  const [states, categories] = await Promise.all([
    getStatesWithCities(),
    getTasksByCategory(),
  ]);

  return (
    <div className="space-y-12">
      <section className="space-y-5 py-8 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-bold tracking-tight">
          German bureaucracy, explained for your city
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Anmeldung, residence permit, health insurance, tax ID — every city
          does it differently. Pick yours and get the exact steps, documents
          and official links.
        </p>
        <div className="flex justify-center">
          <CityPicker
            states={states.map((s) => ({
              id: s.id,
              name_en: s.name_en,
              cities: s.cities
                .filter((c) => c.is_published)
                .map((c) => ({ slug: c.slug, name_en: c.name_en })),
            }))}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-sm">
          {AUDIENCES.map((a) => (
            <span
              key={a.key}
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-muted-foreground"
            >
              <a.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {a.label}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">What do you need to do?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="rounded-lg border p-4">
              <h3 className="mb-2 font-medium">{category.name_en}</h3>
              <ul className="space-y-1 text-sm">
                {category.tasks.map((task) => (
                  <li key={task.id}>
                    <Link
                      href={`/tasks/${task.slug}`}
                      className="text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {task.title_en}{" "}
                      <span className="text-xs">({task.title_de})</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border bg-muted/40 p-6">
        <h2 className="mb-2 text-xl font-semibold">
          Stuck at a German office?
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          No appointment slots for weeks, landlord won&apos;t sign the
          Wohnungsgeberbestätigung, bank wants documents you can&apos;t get yet
          — you are not the first. Browse practical solutions from people who
          hit the same wall.
        </p>
        <Link href="/problems" className="text-sm font-medium underline">
          Browse problems &amp; solutions →
        </Link>
      </section>
    </div>
  );
}
