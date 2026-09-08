import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ADMIN_TABLES } from "@/lib/admin/schema";
import { rowCount } from "@/lib/admin/data";

export default async function AdminOverviewPage() {
  const counts = await Promise.all(
    ADMIN_TABLES.map(async (t) => [t.name, await rowCount(t)] as const),
  );
  const countMap = Object.fromEntries(counts);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Content</h1>
      <p className="mt-1 max-w-prose text-sm text-muted">
        Edit anything on the site. Changes go live immediately after saving;
        the affected pages are revalidated for you.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {ADMIN_TABLES.map((t) => (
          <Link
            key={t.name}
            href={`/admin/${t.name}`}
            className="group flex items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/25"
          >
            <div className="min-w-0">
              <p className="font-medium">
                {t.label}{" "}
                <span className="text-sm font-normal text-muted">
                  · {countMap[t.name]}
                </span>
              </p>
              <p className="mt-0.5 text-sm text-muted">{t.description}</p>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
