import { ExternalLink } from "lucide-react";
import { getPartnerOffers } from "@/lib/queries/content";

/**
 * "Recommended services" box shown on a task guide page. Renders both
 * affiliate partners (with disclosure + sponsored rel) and our own apps
 * ("Our app"). Only published offers are returned by the query, so slots
 * without real links simply don't render.
 */
export async function PartnerOffers({ taskSlug }: { taskSlug: string }) {
  const offers = await getPartnerOffers(taskSlug);
  if (offers.length === 0) return null;

  const hasAffiliate = offers.some((o) => o.kind === "affiliate");

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Recommended services</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {offers.map((offer) => (
          <a
            key={offer.id}
            href={offer.url}
            target="_blank"
            rel={
              offer.kind === "affiliate"
                ? "sponsored nofollow noopener noreferrer"
                : "noopener noreferrer"
            }
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{offer.name}</span>
              <span className="rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                {offer.kind === "own_app" ? "Our app" : "Partner"}
              </span>
            </div>
            {offer.blurb_md && (
              <p className="mt-1 text-sm text-muted-foreground">
                {offer.blurb_md}
              </p>
            )}
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium group-hover:underline">
              {offer.cta_label}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </a>
        ))}
      </div>
      {hasAffiliate && (
        <p className="text-xs text-muted-foreground">
          Some links above are partner links — if you sign up through them we may
          earn a commission, at no extra cost to you. We only list services we
          consider genuinely useful.
        </p>
      )}
    </section>
  );
}
