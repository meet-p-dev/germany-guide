import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { getLatestUpdate } from "@/lib/content";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

/** Slim strip under the hero surfacing the newest "what changed" item. */
export async function LatestUpdate() {
  const update = await getLatestUpdate();
  if (!update) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <Link
        href="/updates"
        className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:px-5"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Megaphone className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">
          <span className="font-semibold">{update.title}</span>
          <span className="ml-2 hidden text-muted sm:inline">
            {DATE_FORMAT.format(new Date(`${update.published_at}T00:00:00Z`))} ·
            what changed in Germany
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary">
          <span className="hidden sm:inline">All updates</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}
