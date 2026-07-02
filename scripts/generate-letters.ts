/**
 * Generate letter-helper entries from the taxonomy briefs.
 *
 *   npx tsx scripts/generate-letters.ts                 # all briefs without an existing slug
 *   npx tsx scripts/generate-letters.ts --brief "..."   # one ad-hoc brief
 *
 * Everything lands as status='draft'; publish via /admin/review.
 */
import { letterSchema } from "../lib/content-schemas";
import { anthropic, arg, generateJson, loadPrompt, MODEL, serviceClient } from "./lib";

const BRIEFS = [
  "Rundfunkbeitrag Festsetzungsbescheid — the formal fee-setting notice from the Beitragsservice when someone hasn't paid the broadcasting fee. Consequences of ignoring it (enforcement), how to object (Widerspruch), how to pay or apply for exemption.",
  "Krankenkasse membership confirmation and contribution notice (Mitgliedsbescheinigung / Beitragsbescheid) — what it confirms, why the employer/university needs it, checking the contribution amount.",
  "Ausländerbehörde document request or appointment notice for a pending residence application — recognizing what is being asked, deadlines, how to submit documents, what happens if the appointment can't be kept.",
  "Anmeldebestätigung — the registration confirmation itself: what it is used for, who will ask for it, replacing a lost one.",
  "Finanzamt letter assigning a Steuernummer (tax number) for freelancers/self-employed — difference from the Steuer-ID, when it is needed, keeping it for invoices.",
  "A generic Mahnung (payment reminder) from any company or authority — anatomy of a German dunning letter: original claim, Mahngebühren, escalation stages up to Inkasso and Mahnbescheid, what to do if the claim is wrong.",
] as const;

async function main() {
  const db = serviceClient();
  const client = anthropic();

  const { data: tasks } = await db.from("tasks").select("id, slug");
  const taskBySlug = new Map((tasks ?? []).map((t) => [t.slug, t.id]));

  const adhoc = arg("brief");
  const briefs = adhoc ? [adhoc] : [...BRIEFS];

  const template = loadPrompt("letter.md").replace(
    "{{TASK_SLUGS}}",
    [...taskBySlug.keys()].join(", ")
  );

  for (const brief of briefs) {
    const generated = await generateJson(
      client,
      template.replace("{{BRIEF}}", brief),
      letterSchema
    );

    const { data: existing } = await db
      .from("letters")
      .select("id")
      .eq("slug", generated.slug)
      .maybeSingle();
    if (existing && !adhoc) {
      console.log(`skip (exists): ${generated.slug}`);
      continue;
    }

    const { error } = await db.from("letters").upsert(
      {
        slug: generated.slug,
        title_de: generated.title_de,
        title_en: generated.title_en,
        sender: generated.sender,
        what_it_means_md: generated.what_it_means_md,
        what_to_do_md: generated.what_to_do_md,
        deadline_note: generated.deadline_note,
        looks_like_md: generated.looks_like_md,
        urgency: generated.urgency,
        related_task_id: generated.related_task_slug
          ? (taskBySlug.get(generated.related_task_slug) ?? null)
          : null,
        status: "draft",
        sources: generated.sources,
        generated_by: MODEL,
      },
      { onConflict: "slug,locale" }
    );
    if (error) throw error;

    console.log(`✔ draft: ${generated.slug}`);
    console.log(`  note: ${generated.confidence_note}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
