import type { Metadata } from "next";
import { getGlossaryTerms } from "@/lib/content";
import { GlossaryBrowser } from "@/components/glossary/glossary-browser";
import { Kicker } from "@/components/ui/kicker";

export const metadata: Metadata = {
  title: "Glossary — German bureaucracy, translated",
  description:
    "Anmeldung, Ausländerbehörde, Wohnungsgeberbestätigung — every German bureaucracy term explained in plain English.",
};

export const revalidate = 3600;

export default async function GlossaryPage() {
  const terms = await getGlossaryTerms();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <Kicker>Glossary</Kicker>
      <h1 className="font-display mt-3 text-4xl font-bold sm:text-5xl">
        German bureaucracy, translated.
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        The words on your letters, forms and office doors — each one in plain
        English. The German terms are worth learning; officials will use them,
        and now they won&apos;t scare you.
      </p>

      <GlossaryBrowser terms={terms} />
    </div>
  );
}
