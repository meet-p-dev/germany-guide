import Link from "next/link";
import type { Metadata } from "next";
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
      <h1 className="text-3xl font-bold">Search</h1>
      <form action="/search" method="get" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Try: Anmeldung, GEZ, tax ID, SCHUFA…"
          className="h-11 flex-1 rounded-md border bg-background px-3"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-5 font-medium text-primary-foreground hover:opacity-90"
        >
          Search
        </button>
      </form>

      {q?.trim() && results.length === 0 && (
        <p className="text-muted-foreground">
          No results for “{q}”. Try a German term (e.g. “Anmeldung”) or an
          English one (e.g. “registration”).
        </p>
      )}

      <ul className="space-y-3">
        {results.map((r) => (
          <li key={`${r.kind}:${r.slug}`}>
            <Link
              href={`${KIND_PATH[r.kind] ?? ""}/${r.slug}`}
              className="block rounded-lg border bg-card p-4 hover:bg-accent"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                  {KIND_LABEL[r.kind] ?? r.kind}
                </span>
                <span className="font-medium">{r.title}</span>
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
