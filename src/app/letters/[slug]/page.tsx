import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ListChecks, Mail } from "lucide-react";
import { getLetterBySlug, getLetters } from "@/lib/content";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

export const revalidate = 3600;
export const dynamicParams = true;

const URGENCY_STYLES: Record<string, string> = {
  high: "border-primary/30 bg-primary-soft text-primary",
  medium: "border-gold/30 bg-gold-soft text-gold",
  low: "border-success/30 bg-success-soft text-success",
};

const URGENCY_LABELS: Record<string, string> = {
  high: "Act now — this one has real deadlines",
  medium: "Respond soon — routine but not ignorable",
  low: "No rush — file it and relax",
};

export async function generateStaticParams() {
  const letters = await getLetters();
  return letters.map((letter) => ({ slug: letter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const letter = await getLetterBySlug(slug);
  if (!letter) return {};
  return {
    title: `${letter.name} — what it means`,
    description: `Received "${letter.german_name ?? letter.name}"${letter.sender ? ` from ${letter.sender}` : ""}? What it is, how urgent it is, and what to do.`,
  };
}

export default async function LetterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const letter = await getLetterBySlug(slug);
  if (!letter) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/letters" className="hover:text-foreground">
          Letter helper
        </Link>
      </nav>

      <h1 className="font-display mt-4 text-4xl font-bold sm:text-5xl">
        {letter.name}
      </h1>
      <p className="mt-3 text-muted">
        {letter.german_name && (
          <span className="italic">{letter.german_name}</span>
        )}
        {letter.german_name && letter.sender && " · "}
        {letter.sender && <>sent by {letter.sender}</>}
      </p>

      <p
        className={cn(
          "mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
          URGENCY_STYLES[letter.urgency] ?? URGENCY_STYLES.medium,
        )}
      >
        <AlertTriangle className="h-4 w-4" />
        {URGENCY_LABELS[letter.urgency] ?? letter.urgency}
      </p>

      <section className="mt-8 rounded-3xl border border-border bg-card p-6">
        <p className="font-display flex items-center gap-2 font-bold">
          <Mail className="h-5 w-5 text-primary" />
          What this letter is
        </p>
        <Markdown className="mt-3">{letter.what_it_is_md}</Markdown>
      </section>

      <section className="mt-8">
        <p className="font-display flex items-center gap-2 text-xl font-bold">
          <ListChecks className="h-5 w-5 text-primary" />
          What to do
        </p>
        <Markdown className="mt-4">{letter.what_to_do_md}</Markdown>
      </section>

      <p className="mt-12 border-t border-border pt-6 text-xs leading-relaxed text-muted">
        General information, not legal advice. Always verify payment details on
        the sender&apos;s official website before transferring money.
      </p>
    </article>
  );
}
