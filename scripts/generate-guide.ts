/**
 * Generate the generic (Germany-wide) guide for a task from official sources.
 *
 *   npx tsx scripts/generate-guide.ts --task anmeldung \
 *     --source https://www.bmi.bund.de/... --source https://service.berlin.de/...
 *
 * Inserts/updates the guide as status='draft'. Publish via /admin/review.
 */
import { guideSchema } from "../lib/content-schemas";
import {
  anthropic,
  arg,
  args,
  fetchSourceText,
  generateJson,
  loadPrompt,
  MODEL,
  serviceClient,
  today,
} from "./lib";

async function main() {
  const taskSlug = arg("task");
  const sourceUrls = args("source");
  if (!taskSlug || sourceUrls.length === 0) {
    console.error(
      "Usage: npx tsx scripts/generate-guide.ts --task <slug> --source <url> [--source <url>...]"
    );
    process.exit(1);
  }

  const db = serviceClient();
  const { data: task } = await db
    .from("tasks")
    .select("id, title_en, title_de")
    .eq("slug", taskSlug)
    .single();
  if (!task) throw new Error(`Unknown task: ${taskSlug}`);

  console.log(`Fetching ${sourceUrls.length} source(s)…`);
  const sources = await Promise.all(
    sourceUrls.map(async (url) => ({
      url,
      text: await fetchSourceText(url),
    }))
  );

  const prompt = loadPrompt("guide.md")
    .replaceAll("{{TASK_TITLE}}", task.title_en)
    .replaceAll("{{TASK_TITLE_DE}}", task.title_de)
    .replaceAll("{{TODAY}}", today())
    .replace(
      "{{SOURCES}}",
      sources.map((s) => `--- SOURCE: ${s.url} ---\n${s.text}`).join("\n\n")
    );

  console.log(`Generating guide for "${task.title_en}" with ${MODEL}…`);
  const generated = await generateJson(anthropic(), prompt, guideSchema);

  const { data: guide, error } = await db
    .from("guides")
    .upsert(
      {
        task_id: task.id,
        intro_md: generated.intro_md,
        documents_md: generated.documents_md,
        after_md: generated.after_md,
        legal_basis: generated.legal_basis,
        status: "draft",
        sources: generated.sources,
        generated_by: MODEL,
      },
      { onConflict: "task_id,locale" }
    )
    .select("id")
    .single();
  if (error) throw error;

  // Replace steps wholesale — the draft hasn't been reviewed yet.
  await db.from("checklist_steps").delete().eq("guide_id", guide.id);
  const { error: stepsError } = await db.from("checklist_steps").insert(
    generated.steps.map((s, i) => ({
      guide_id: guide.id,
      step_no: i + 1,
      title_en: s.title_en,
      body_md: s.body_md,
      doc_names: s.doc_names,
      is_optional: s.is_optional,
    }))
  );
  if (stepsError) throw stepsError;

  console.log(`✔ Draft saved (guide ${guide.id}, ${generated.steps.length} steps).`);
  console.log(`  Reviewer note: ${generated.confidence_note}`);
  console.log(`  Review and publish at /admin/review.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
