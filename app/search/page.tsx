import Link from "next/link";
import type { Metadata } from "next";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { searchContent } from "@/lib/queries/content";

export const metadata: Metadata = {
  title: "Search",
};

const KIND_PATH: Record<string, string> = {
  guide: "/tasks",
  problem: "/problems",
  letter: "/letters",
  glossary: "/glossary",
};

const KIND_LABEL: Record<string, string> = {
  guide: "Guide",
  problem: "Problem",
  letter: "Letter",
  glossary: "Glossary",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const results = q?.trim() ? await searchContent(q.trim()) : [];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Search
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
          Find your way through
        </h1>
      </header>
      <form action="/search" method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Try: Anmeldung, GEZ, tax ID, SCHUFA…"
          className="h-11 flex-1 rounded-full border border-border bg-card px-4 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        />
        <button
          type="submit"
          className="rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </form>

      {q?.trim() && results.length === 0 && (
        <p className="rounded-2xl border border-border bg-secondary/40 p-6 text-muted-foreground">
          No results for “{q}”. Try a German term (e.g. “Anmeldung”) or an
          English one (e.g. “registration”).
        </p>
      )}

      <ul className="space-y-3">
        {results.map((r) => (
          <li key={`${r.kind}:${r.slug}`}>
            <Link
              href={`${KIND_PATH[r.kind] ?? ""}/${r.slug}`}
              className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary/40"
            >
              <div className="mb-1 flex items-center gap-2">
                <StatusBadge tone="info">
                  {KIND_LABEL[r.kind] ?? r.kind}
                </StatusBadge>
                <span className="font-semibold">{r.title}</span>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {r.snippet.replace(/[*_#`]/g, "")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
