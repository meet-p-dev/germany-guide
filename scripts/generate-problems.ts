/**
 * Generate problem/solution entries from the taxonomy briefs.
 *
 *   npx tsx scripts/generate-problems.ts                 # all briefs without an existing slug
 *   npx tsx scripts/generate-problems.ts --brief "..."   # one ad-hoc brief
 *
 * Everything lands as status='draft'; publish via /admin/review.
 */
import { problemSchema } from "../lib/content-schemas";
import { anthropic, arg, generateJson, loadPrompt, MODEL, serviceClient } from "./lib";

/** One line per problem: what the entry should cover, incl. the solution angle. */
const BRIEFS = [
  "Ausländerbehörde does not respond to emails or contact forms for months while a residence application is pending. Cover: Fiktionsbescheinigung rights while waiting, in-person emergency counters, written reminders, and — after 3+ months of silence — the Untätigkeitsklage (inaction lawsuit) as a last resort with legal advice.",
  "All official forms and letters are in German only. Cover: rights to bring a companion/interpreter, city integration services and Welcome Centers, letter-explainer tools, and asking the office for English material.",
  "The official at the counter speaks only German. Cover: preparing a phrase sheet, bringing a German-speaking friend, requesting written communication, staying calm and polite to keep the interaction cooperative.",
  "Money in the blocked account (Sperrkonto) is not released after arrival. Cover: activation requirements (Anmeldung, bank account), provider support escalation, and what proof the Ausländerbehörde accepts meanwhile.",
  "Confusion between public (gesetzlich) and private (privat) health insurance, incl. the student over-30 trap where switching back to public becomes impossible. Cover: how to decide, and where to get independent advice before signing private contracts.",
  "Person discovers they owe backdated health-insurance contributions (Beitragsschulden) for uninsured months. Cover: why this happens (insurance is mandatory from day one), negotiating payment plans, and hardship/amnesty options.",
  "Rundfunkbeitrag letters keep coming for months already paid, or arrive for an empty/shared flat. Cover: one fee per household rule, linking to a flatmate's Beitragsnummer, exemptions (students on BAföG, low income), and never ignoring the letters.",
  "Wrong tax class (Steuerklasse) after marriage or arrival causes too-high monthly deductions. Cover: checking the payslip, the tax-class change form at the Finanzamt, and that overpaid tax comes back via the yearly tax return.",
  "Tax ID letter never arrived, employer threatens maximum-rate taxation. Cover: requesting the Steuer-ID in person at the Finanzamt, that maximum-rate deduction is refunded later, and keeping the employer informed.",
  "No SCHUFA record as a newcomer leads to apartment application rejections. Cover: the free yearly SCHUFA data copy, alternatives landlords accept (proof of income, employer letter, previous-landlord reference, larger deposit within legal limits).",
  "Fiktionsbescheinigung expires while the application is still pending. Cover: requesting an extension appointment proactively, legality of stay, and the travel warning (re-entry risks depending on the ticked paragraph).",
  "Qualification recognition (Anerkennung) takes many months. Cover: working in non-regulated professions meanwhile, the Anerkennungszuschuss (grant), deficit notices (Defizitbescheid) and adaptation courses.",
  "The earliest available Ausländerbehörde appointment is after the current visa expires. Cover: that a timely application preserves legal stay (Fiktionswirkung), submitting applications in writing before expiry, and keeping proof of submission.",
  "A document from the home country is missing or not accepted (no apostille, no certified translation). Cover: apostille/legalization at home-country authorities, sworn translators (beglaubigte Übersetzung), and consulate services.",
  "A deadline in an official letter was missed because the letter arrived late or went to an old address. Cover: acting immediately, Wiedereinsetzung in den vorigen Stand (reinstatement) basics with a strong get-legal-advice note, and keeping the address registration current.",
  "Registering at a friend's address without actually living there (Scheinanmeldung) seems like an easy fix. Cover: why it is illegal for both sides, the fines, and legal alternatives (registering a temporary sublet properly, hostel registration where allowed).",
  "Long queues at the office even with an appointment, or ending up in the wrong queue/counter. Cover: ticket systems (Wartemarke), arriving early, checking the appointment confirmation for room/counter numbers, and asking staff early.",
] as const;

async function main() {
  const db = serviceClient();
  const client = anthropic();

  const [{ data: tasks }, { data: cities }] = await Promise.all([
    db.from("tasks").select("id, slug"),
    db.from("cities").select("id, slug"),
  ]);
  const taskBySlug = new Map((tasks ?? []).map((t) => [t.slug, t.id]));
  const cityBySlug = new Map((cities ?? []).map((c) => [c.slug, c.id]));

  const adhoc = arg("brief");
  const briefs = adhoc ? [adhoc] : [...BRIEFS];

  const template = loadPrompt("problem.md")
    .replace("{{TASK_SLUGS}}", [...taskBySlug.keys()].join(", "))
    .replace("{{CITY_SLUGS}}", [...cityBySlug.keys()].join(", "));

  for (const brief of briefs) {
    const generated = await generateJson(
      client,
      template.replace("{{BRIEF}}", brief),
      problemSchema
    );

    const { data: existing } = await db
      .from("problems")
      .select("id")
      .eq("slug", generated.slug)
      .maybeSingle();
    if (existing && !adhoc) {
      console.log(`skip (exists): ${generated.slug}`);
      continue;
    }

    const { data: problem, error } = await db
      .from("problems")
      .upsert(
        {
          slug: generated.slug,
          title_en: generated.title_en,
          description_md: generated.description_md,
          severity: generated.severity,
          related_task_ids: generated.related_task_slugs
            .map((s) => taskBySlug.get(s))
            .filter((id): id is string => !!id),
          status: "draft",
          sources: generated.sources,
          generated_by: MODEL,
        },
        { onConflict: "slug,locale" }
      )
      .select("id")
      .single();
    if (error) throw error;

    await db.from("solutions").delete().eq("problem_id", problem.id);
    const { error: solError } = await db.from("solutions").insert(
      generated.solutions.map((s, i) => ({
        problem_id: problem.id,
        city_id: s.city_slug ? (cityBySlug.get(s.city_slug) ?? null) : null,
        title_en: s.title_en,
        body_md: s.body_md,
        effectiveness: s.effectiveness,
        sort_order: i,
        status: "draft" as const,
      }))
    );
    if (solError) throw solError;

    console.log(`✔ draft: ${generated.slug} (${generated.solutions.length} solutions)`);
    console.log(`  note: ${generated.confidence_note}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
