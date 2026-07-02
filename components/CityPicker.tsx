"use client";

import { useRouter } from "next/navigation";

type StateWithCities = {
  id: string;
  name_en: string;
  cities: { slug: string; name_en: string }[];
};

export function CityPicker({
  states,
  currentCity,
  compact = false,
}: {
  states: StateWithCities[];
  currentCity?: string;
  compact?: boolean;
}) {
  const router = useRouter();

  function onChange(slug: string) {
    if (!slug) return;
    document.cookie = `city=${slug};path=/;max-age=31536000;samesite=lax`;
    router.push(`/germany/${slug}`);
  }

  return (
    <select
      aria-label="Choose your city"
      defaultValue={currentCity ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className={
        compact
          ? "h-9 rounded-md border bg-background px-2 text-sm"
          : "h-12 w-full max-w-md rounded-lg border bg-background px-3 text-base shadow-sm"
      }
    >
      <option value="" disabled>
        {compact ? "City…" : "Choose your city…"}
      </option>
      {states.map((state) => (
        <optgroup key={state.id} label={state.name_en}>
          {state.cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name_en}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
