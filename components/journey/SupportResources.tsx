import { ExternalLink } from "lucide-react";
import type { SupportResource } from "@/lib/queries/content";
import { SUPPORT_CATEGORIES } from "@/lib/persona-copy";

/**
 * Verified support resources for the /journey/refugee page. Every row shown
 * here comes from the `support_resources` table, which anon reads see only when
 * active = true (migration 0007 RLS) — so nothing unverified can render.
 *
 * Honesty over completeness: we walk the full controlled category set and, for
 * any category with no verified row yet, say so plainly rather than leaving a
 * silent gap. Names/links/descriptions are DB facts; only the category labels
 * and framing sentences are UI copy.
 */
function regionLabel(region: string): string {
  // support_resources.region is an existing city slug (single word for our
  // cities); Title-case it for display. NULL regions are national and don't
  // reach this helper.
  return region.charAt(0).toUpperCase() + region.slice(1);
}

export function SupportResources({
  resources,
}: {
  resources: SupportResource[];
}) {
  const byCategory = new Map<string, SupportResource[]>();
  for (const r of resources) {
    const list = byCategory.get(r.category) ?? [];
    list.push(r);
    byCategory.set(r.category, list);
  }

  return (
    <section aria-labelledby="support-heading" className="mt-10">
      <h2 id="support-heading" className="gg-h2 text-gg-ink">
        Verified support near you
      </h2>
      <p className="gg-body-sm mt-2 text-gg-muted">
        Free, independently link-checked services. Each link opens an official
        or established organisation&apos;s own site.
      </p>

      <div className="mt-6 space-y-8">
        {SUPPORT_CATEGORIES.map(({ key, label }) => {
          const items = byCategory.get(key) ?? [];
          return (
            <div key={key}>
              <h3 className="gg-h3 text-gg-ink">{label}</h3>

              {items.length === 0 ? (
                <p className="gg-body-sm mt-2 text-gg-muted">
                  Verified resources for this are still being added — we&apos;d
                  rather show nothing here than an unchecked link.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {items.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-[14px] border border-gg-border bg-gg-card p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="gg-body inline-flex items-start gap-1.5 font-medium text-gg-brand-ink hover:underline"
                        >
                          {r.name}
                          <ExternalLink
                            className="mt-0.5 size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                        </a>
                        {r.region && (
                          <span className="gg-caption shrink-0 rounded-full bg-gg-brand-soft px-2.5 py-0.5 font-semibold text-gg-brand-ink">
                            {regionLabel(r.region)}
                          </span>
                        )}
                      </div>
                      <p className="gg-body-sm mt-1.5 text-gg-muted">
                        {r.description}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
