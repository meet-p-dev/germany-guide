import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { TriangleAlert } from "lucide-react";
import { Disclaimer, FreshnessNote } from "@/components/Disclaimer";
import { Markdown } from "@/components/Markdown";
import { getLetterBySlug, getLetters } from "@/lib/queries/content";

export const revalidate = 3600;

export async function generateStaticParams() {
  const letters = await getLetters();
  return letters.map((l) => ({ letter: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ letter: string }>;
}): Promise<Metadata> {
  const { letter: slug } = await params;
  const letter = await getLetterBySlug(slug);
  if (!letter) return {};
  return {
    title: `${letter.title_de} — what this German letter means`,
    description: `Received a "${letter.title_de}"${letter.sender ? ` from ${letter.sender}` : ""}? What it means in English, how urgent it is, and what to do.`,
    alternates: { canonical: `/letters/${letter.slug}` },
  };
}

export default async function LetterPage({
  params,
}: {
  params: Promise<{ letter: string }>;
}) {
  const { letter: slug } = await params;
  const letter = await getLetterBySlug(slug);
  if (!letter) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          <Link href="/letters" className="hover:underline">
            Letter helper
          </Link>
        </p>
        <h1 className="text-3xl font-bold">{letter.title_de}</h1>
        <p className="text-lg text-muted-foreground">
          {letter.title_en}
          {letter.sender ? ` · sent by ${letter.sender}` : ""}
        </p>
        {letter.urgency !== "info" && (
          <p className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-3 py-1 text-sm font-medium text-amber-900 dark:bg-amber-950 dark:text-amber-200">
            {letter.urgency === "urgent" && (
              <TriangleAlert className="h-4 w-4" aria-hidden="true" />
            )}
            {letter.urgency === "urgent" ? "Urgent — act quickly" : "Action needed"}
            {letter.deadline_note ? ` — ${letter.deadline_note}` : ""}
          </p>
        )}
      </div>

      {letter.looks_like_md && (
        <section className="space-y-2 rounded-lg border bg-muted/40 p-4 text-sm">
          <h2 className="font-medium">How to recognize it</h2>
          <Markdown>{letter.looks_like_md}</Markdown>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What this letter means</h2>
        <Markdown>{letter.what_it_means_md}</Markdown>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">What to do</h2>
        <Markdown>{letter.what_to_do_md}</Markdown>
      </section>

      {letter.tasks && (
        <p className="text-sm">
          Related guide:{" "}
          <Link href={`/tasks/${letter.tasks.slug}`} className="underline">
            {letter.tasks.title_en}
          </Link>
        </p>
      )}

      <Disclaimer />
      <FreshnessNote
        lastVerifiedAt={letter.last_verified_at}
        sources={letter.sources}
      />
    </div>
  );
}
