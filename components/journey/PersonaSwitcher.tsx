import Link from "next/link";
import { cn } from "@/lib/utils";
import { PERSONAS } from "@/lib/persona-copy";

/**
 * Switch between persona path pages. Changing persona changes the stage detail,
 * not the layout. Styled as quiet secondary controls so it never competes with
 * the single primary "Build my personal plan" CTA (Part-1 Rule 1).
 */
export function PersonaSwitcher({ current }: { current: string }) {
  return (
    <nav aria-label="Choose your situation" className="flex flex-wrap gap-2">
      {PERSONAS.map((p) => {
        const active = p.slug === current;
        return (
          <Link
            key={p.slug}
            href={`/journey/${p.slug}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "gg-body-sm rounded-full border px-3.5 py-1.5 font-medium transition-[filter]",
              active
                ? "border-transparent bg-gg-brand-soft text-gg-brand-ink"
                : "border-gg-border bg-gg-card text-gg-muted hover:brightness-[0.98] hover:text-gg-ink"
            )}
          >
            {p.label}
          </Link>
        );
      })}
      <Link
        href="/journey"
        className="gg-body-sm rounded-full px-3.5 py-1.5 font-medium text-gg-muted underline-offset-4 hover:text-gg-ink hover:underline"
      >
        Not sure yet — see the full map
      </Link>
    </nav>
  );
}
