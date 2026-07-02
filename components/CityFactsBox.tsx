import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Markdown } from "@/components/Markdown";
import { FreshnessNote } from "@/components/Disclaimer";
import type { Tables } from "@/lib/database.types";

export function CityFactsBox({
  cityName,
  variant,
}: {
  cityName: string;
  variant: Tables<"city_task_variants">;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          How it works in {cityName}
          {variant.appointment_required === true && (
            <Badge variant="destructive">Appointment required</Badge>
          )}
          {variant.walk_in_possible === true && (
            <Badge className="bg-green-600 text-white">Walk-in possible</Badge>
          )}
          {variant.online_possible === true && (
            <Badge variant="secondary">Online option</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {variant.office_name && (
            <div>
              <dt className="font-medium">Office</dt>
              <dd className="text-muted-foreground">{variant.office_name}</dd>
            </div>
          )}
          {variant.office_address && (
            <div>
              <dt className="font-medium">Address</dt>
              <dd className="text-muted-foreground">
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(variant.office_address)}`}
                  target="_blank"
                  rel="noopener nofollow"
                  className="underline"
                >
                  {variant.office_address}
                </a>
              </dd>
            </div>
          )}
          {variant.office_hours && (
            <div>
              <dt className="font-medium">Opening hours</dt>
              <dd className="text-muted-foreground">{variant.office_hours}</dd>
            </div>
          )}
          {variant.typical_wait_time && (
            <div>
              <dt className="font-medium">Typical wait</dt>
              <dd className="text-muted-foreground">
                {variant.typical_wait_time}
              </dd>
            </div>
          )}
          <div>
            <dt className="font-medium">Fees</dt>
            <dd className="text-muted-foreground">
              {variant.fees_eur === 0
                ? "Free of charge"
                : variant.fees_eur != null
                  ? `€${variant.fees_eur}`
                  : (variant.fees_note ?? "Not verified")}
              {variant.fees_eur != null && variant.fees_note
                ? ` — ${variant.fees_note}`
                : null}
            </dd>
          </div>
        </dl>
        {variant.booking_url && (
          <a
            href={variant.booking_url}
            target="_blank"
            rel="noopener nofollow"
            className="inline-block rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90"
          >
            Official booking site →
          </a>
        )}
        {variant.city_notes_md && <Markdown>{variant.city_notes_md}</Markdown>}
        <FreshnessNote
          lastVerifiedAt={variant.last_verified_at}
          sources={variant.sources}
        />
      </CardContent>
    </Card>
  );
}
