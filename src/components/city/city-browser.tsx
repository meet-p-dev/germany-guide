"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { CityPhoto } from "@/components/city/city-photo";
import { cn } from "@/lib/utils";

export interface BrowserCity {
  slug: string;
  name: string;
  state: string;
  tagline: string | null;
  image: string | null;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Normalise for search and grouping — Münster → munster, Ü → u. */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function CityBrowser({ cities }: { cities: BrowserCity[] }) {
  const [query, setQuery] = useState("");
  const q = fold(query.trim());

  const filtered = useMemo(
    () =>
      q
        ? cities.filter(
            (city) => fold(city.name).includes(q) || fold(city.state).includes(q),
          )
        : cities,
    [cities, q],
  );

  // Letter → cities, for the browse (no-query) view.
  const groups = useMemo(() => {
    const map = new Map<string, BrowserCity[]>();
    for (const city of [...cities].sort((a, b) =>
      fold(a.name) < fold(b.name) ? -1 : 1,
    )) {
      const letter = fold(city.name).charAt(0).toUpperCase();
      const key = /[A-Z]/.test(letter) ? letter : "#";
      (map.get(key) ?? map.set(key, []).get(key)!).push(city);
    }
    return map;
  }, [cities]);

  return (
    <div>
      {/* Search */}
      <div className="relative mt-10 max-w-md">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a city or state…"
          aria-label="Search cities"
          className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-11 text-[15px] outline-none focus:border-primary"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-card-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* A–Z jump bar (browse view only) */}
      {!q && (
        <div className="mt-6 flex flex-wrap gap-1">
          {ALPHABET.map((letter) => {
            const has = groups.has(letter);
            return has ? (
              <a
                key={letter}
                href={`#city-${letter}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold text-primary transition-colors hover:bg-primary-soft"
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium text-muted/40"
              >
                {letter}
              </span>
            );
          })}
        </div>
      )}

      {/* Results */}
      {q ? (
        filtered.length > 0 ? (
          <>
            <p className="mt-8 text-sm text-muted">
              {filtered.length} {filtered.length === 1 ? "city" : "cities"} match
              &ldquo;{query.trim()}&rdquo;
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((city) => (
                <CityCard key={city.slug} city={city} />
              ))}
            </div>
          </>
        ) : (
          <p className="mt-10 rounded-3xl border border-dashed border-border bg-card-muted/50 p-8 text-center text-muted">
            No city called &ldquo;{query.trim()}&rdquo; yet, but every step&apos;s
            Germany-wide guide still applies wherever you land.
          </p>
        )
      ) : (
        <div className="mt-8 space-y-10">
          {[...groups.entries()].map(([letter, list]) => (
            <section key={letter} id={`city-${letter}`} className="scroll-mt-24">
              <h2 className="font-display text-2xl font-bold text-muted">
                {letter}
              </h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((city) => (
                  <CityCard key={city.slug} city={city} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CityCard({ city }: { city: BrowserCity }) {
  return (
    <Link
      href={`/cities/${city.slug}`}
      className={cn(
        "group block h-full overflow-hidden rounded-3xl border border-border bg-card",
        "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
      )}
    >
      <div className="relative h-44 overflow-hidden">
        <CityPhoto
          image={city.image}
          alt={`${city.name}, ${city.tagline ?? city.state}`}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-5 text-white">
          <p className="font-display text-2xl font-bold">{city.name}</p>
          <p className="text-xs text-white/80">{city.state}</p>
        </div>
      </div>
      {city.tagline && (
        <p className="p-5 text-sm leading-relaxed text-muted">{city.tagline}</p>
      )}
    </Link>
  );
}
