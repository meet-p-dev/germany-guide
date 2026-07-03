import Link from "next/link";
import { getRelatedContent } from "@/lib/queries/content";

/**
 * "Related" section for guide pages: linked problems and German glossary terms
 * tied to this task. Improves internal linking and helps users find more.
 */
export async function RelatedContent({ taskId }: { taskId: string }) {
  const { problems, glossary } = await getRelatedContent(taskId);
  if (problems.length === 0 && glossary.length === 0) return null;

  return (
    <section className="space-y-4 border-t pt-6">
      {problems.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Common problems</h2>
          <ul className="space-y-1 text-sm">
            {problems.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/problems/${p.slug}`}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  {p.title_en}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {glossary.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Related German terms</h2>
          <div className="flex flex-wrap gap-2">
            {glossary.map((g) => (
              <Link
                key={g.slug}
                href={`/glossary/${g.slug}`}
                className="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                title={g.term_en}
              >
                {g.term_de}
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
