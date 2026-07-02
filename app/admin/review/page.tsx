import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, isAdminEmail } from "@/lib/supabase/admin";
import { Markdown } from "@/components/Markdown";
import { PublishControls } from "./PublishControls";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) redirect("/auth/login");

  const db = createAdminClient();
  const [guides, variants, problems, letters, glossary] = await Promise.all([
    db
      .from("guides")
      .select("id, status, generated_by, intro_md, tasks(title_en, slug)")
      .in("status", ["draft", "reviewed"]),
    db
      .from("city_task_variants")
      .select(
        "id, status, generated_by, city_notes_md, booking_url, appointment_required, walk_in_possible, cities(name_en), tasks(title_en)"
      )
      .in("status", ["draft", "reviewed"]),
    db
      .from("problems")
      .select("id, status, generated_by, title_en, description_md")
      .in("status", ["draft", "reviewed"]),
    db
      .from("letters")
      .select("id, status, generated_by, title_en, title_de, what_it_means_md")
      .in("status", ["draft", "reviewed"]),
    db
      .from("glossary_terms")
      .select("id, status, term_de, term_en, definition_md")
      .in("status", ["draft", "reviewed"]),
  ]);

  const sections = [
    {
      table: "guides" as const,
      title: "Guides",
      rows: (guides.data ?? []).map((g) => ({
        id: g.id,
        status: g.status,
        heading: `${g.tasks?.title_en} (generic guide)`,
        generatedBy: g.generated_by,
        preview: g.intro_md,
      })),
    },
    {
      table: "city_task_variants" as const,
      title: "City variants",
      rows: (variants.data ?? []).map((v) => ({
        id: v.id,
        status: v.status,
        heading: `${v.tasks?.title_en} — ${v.cities?.name_en}`,
        generatedBy: v.generated_by,
        preview: [
          v.appointment_required != null &&
            `appointment_required: ${v.appointment_required}`,
          v.walk_in_possible != null && `walk_in: ${v.walk_in_possible}`,
          v.booking_url && `booking: ${v.booking_url}`,
          v.city_notes_md,
        ]
          .filter(Boolean)
          .join("\n\n"),
      })),
    },
    {
      table: "problems" as const,
      title: "Problems",
      rows: (problems.data ?? []).map((p) => ({
        id: p.id,
        status: p.status,
        heading: p.title_en,
        generatedBy: p.generated_by,
        preview: p.description_md,
      })),
    },
    {
      table: "letters" as const,
      title: "Letters",
      rows: (letters.data ?? []).map((l) => ({
        id: l.id,
        status: l.status,
        heading: `${l.title_en} (${l.title_de})`,
        generatedBy: l.generated_by,
        preview: l.what_it_means_md,
      })),
    },
    {
      table: "glossary_terms" as const,
      title: "Glossary terms",
      rows: (glossary.data ?? []).map((t) => ({
        id: t.id,
        status: t.status,
        heading: `${t.term_de} — ${t.term_en}`,
        generatedBy: null,
        preview: t.definition_md,
      })),
    },
  ];

  const total = sections.reduce((n, s) => n + s.rows.length, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Review queue ({total})</h1>
      {total === 0 && (
        <p className="text-muted-foreground">
          Nothing waiting for review. Run a generation script to create drafts.
        </p>
      )}
      {sections
        .filter((s) => s.rows.length > 0)
        .map((section) => (
          <section key={section.table} className="space-y-3">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            {section.rows.map((row) => (
              <details key={row.id} className="rounded-lg border bg-card p-4">
                <summary className="cursor-pointer font-medium">
                  {row.heading}{" "}
                  <span className="text-xs text-muted-foreground">
                    [{row.status}
                    {row.generatedBy ? ` · ${row.generatedBy}` : ""}]
                  </span>
                </summary>
                <div className="mt-3 space-y-3 border-t pt-3 text-sm">
                  <Markdown>{row.preview ?? ""}</Markdown>
                  <p className="text-xs text-muted-foreground">
                    Edit content in Supabase Studio, then publish here.
                  </p>
                  <PublishControls table={section.table} id={row.id} />
                </div>
              </details>
            ))}
          </section>
        ))}
    </div>
  );
}
