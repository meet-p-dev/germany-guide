/**
 * Generate the city-specific variant of a task from official city pages.
 *
 *   npx tsx scripts/generate-variant.ts --task anmeldung --city hamburg \
 *     --source https://www.hamburg.de/...
 *
 * Inserts/updates the variant as status='draft'. Publish via /admin/review.
 */
import { variantSchema } from "../lib/content-schemas";
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
  const citySlug = arg("city");
  const sourceUrls = args("source");
  if (!taskSlug || !citySlug || sourceUrls.length === 0) {
    console.error(
      "Usage: npx tsx scripts/generate-variant.ts --task <slug> --city <slug> --source <url> [--source <url>...]"
    );
    process.exit(1);
  }

  const db = serviceClient();
  const [{ data: task }, { data: city }] = await Promise.all([
    db.from("tasks").select("id, title_en, title_de").eq("slug", taskSlug).single(),
    db.from("cities").select("id, name_en").eq("slug", citySlug).single(),
  ]);
  if (!task) throw new Error(`Unknown task: ${taskSlug}`);
  if (!city) throw new Error(`Unknown city: ${citySlug}`);

  console.log(`Fetching ${sourceUrls.length} source(s)…`);
  const sources = await Promise.all(
    sourceUrls.map(async (url) => ({ url, text: await fetchSourceText(url) }))
  );

  const prompt = loadPrompt("variant.md")
    .replaceAll("{{TASK_TITLE}}", task.title_en)
    .replaceAll("{{TASK_TITLE_DE}}", task.title_de)
    .replaceAll("{{CITY_NAME}}", city.name_en)
    .replaceAll("{{TODAY}}", today())
    .replace(
      "{{SOURCES}}",
      sources.map((s) => `--- SOURCE: ${s.url} ---\n${s.text}`).join("\n\n")
    );

  console.log(
    `Generating ${task.title_en} variant for ${city.name_en} with ${MODEL}…`
  );
  const v = await generateJson(anthropic(), prompt, variantSchema);

  // Guardrail: a hallucinated booking URL is worse than none.
  if (v.booking_url && !sources.some((s) => s.text.includes(v.booking_url!) || s.url === v.booking_url)) {
    console.warn(`booking_url not found verbatim in sources — dropping: ${v.booking_url}`);
    v.booking_url = null;
  }

  const { error } = await db.from("city_task_variants").upsert(
    {
      city_id: city.id,
      task_id: task.id,
      appointment_required: v.appointment_required,
      walk_in_possible: v.walk_in_possible,
      online_possible: v.online_possible,
      booking_url: v.booking_url,
      office_name: v.office_name,
      office_address: v.office_address,
      office_hours: v.office_hours,
      typical_wait_time: v.typical_wait_time,
      fees_eur: v.fees_eur,
      fees_note: v.fees_note,
      city_notes_md: v.city_notes_md,
      status: "draft",
      sources: v.sources,
      generated_by: MODEL,
    },
    { onConflict: "city_id,task_id,locale" }
  );
  if (error) throw error;

  console.log(`✔ Draft variant saved for ${city.name_en}/${taskSlug}.`);
  console.log(`  Reviewer note: ${v.confidence_note}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
