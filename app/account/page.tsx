import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: progress } = await supabase
    .from("user_task_progress")
    .select(
      "id, updated_at, completed_step_ids, completed_override_ids, cities(slug, name_en), tasks(slug, title_en, title_de)"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Your progress</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      {!progress?.length ? (
        <p className="rounded-md border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          No synced checklists yet. Open any task guide in your city and start
          ticking steps — progress saves automatically while you are signed in.
        </p>
      ) : (
        <ul className="space-y-3">
          {progress.map((row) => {
            const doneCount =
              row.completed_step_ids.length + row.completed_override_ids.length;
            return (
              <li key={row.id}>
                <Link
                  href={`/germany/${row.cities?.slug}/${row.tasks?.slug}`}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-accent"
                >
                  <span>
                    <span className="font-medium">{row.tasks?.title_en}</span>{" "}
                    <span className="text-sm text-muted-foreground">
                      ({row.tasks?.title_de}) — {row.cities?.name_en}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {doneCount} step{doneCount === 1 ? "" : "s"} done
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
