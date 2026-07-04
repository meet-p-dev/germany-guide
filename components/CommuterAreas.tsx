import { Landmark, Train, Wallet } from "lucide-react";
import { getCommuterAreas } from "@/lib/queries/content";

/**
 * "Where to live & commute from" — nearby towns you could live in and commute
 * to this city, with honest commute time + cost-vs-city. The site's unique,
 * hard-to-find angle: cost-of-living arbitrage across a metro area.
 */
export async function CommuterAreas({
  cityId,
  cityName,
}: {
  cityId: string;
  cityName: string;
}) {
  const areas = await getCommuterAreas(cityId);
  if (areas.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">
        Where to live if you work or study in {cityName}
      </h2>
      <p className="text-sm text-muted-foreground">
        Rents in the city centre are steep. These nearby towns are common
        commuter options — some much cheaper, some not — with a realistic
        commute. Always check current rents yourself; ranges move fast.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {areas.map((a) => (
          <div key={a.id} className="rounded-lg border p-4">
            <p className="font-medium">{a.name}</p>
            <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <Train className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {a.commute_note}
                {a.commute_line && (
                  <span className="block text-xs">Line: {a.commute_line}</span>
                )}
              </span>
            </p>
            <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
              <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {a.cost_note}
                {a.rent_note && (
                  <span className="block text-xs">{a.rent_note}</span>
                )}
              </span>
            </p>
            {a.office_note && (
              <p className="mt-1 flex items-start gap-2 text-sm text-muted-foreground">
                <Landmark
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-xs">{a.office_note}</span>
              </p>
            )}
            {a.why_md && (
              <p className="mt-2 text-sm text-muted-foreground">{a.why_md}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
