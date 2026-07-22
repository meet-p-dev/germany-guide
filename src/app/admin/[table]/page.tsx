import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { getTableConfig } from "@/lib/admin/schema";
import { listRows, fkLabelMaps, rowTitle } from "@/lib/admin/data";
import { DeleteRowButton } from "@/components/admin/delete-row-button";

export default async function TableListPage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table: tableName } = await params;
  const table = getTableConfig(tableName);
  if (!table) notFound();

  const [rows, labelMaps] = await Promise.all([
    listRows(table),
    fkLabelMaps(table),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">{table.label}</h1>
          <p className="mt-1 text-sm text-muted">
            {rows.length} {rows.length === 1 ? "row" : "rows"} · {table.description}
          </p>
        </div>
        <Link
          href={`/admin/${table.name}/new`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          New {table.singular.toLowerCase()}
        </Link>
      </div>

      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {rows.length === 0 && (
          <li className="px-4 py-6 text-sm text-muted">No rows yet.</li>
        )}
        {rows.map((row) => {
          const id = String(row.id);
          const secondary =
            table.secondaryField && row[table.secondaryField] != null
              ? String(row[table.secondaryField])
              : null;
          return (
            <li
              key={id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <Link
                href={`/admin/${table.name}/${id}`}
                className="group min-w-0 flex-1"
              >
                <p className="truncate font-medium group-hover:text-primary">
                  {rowTitle(table, row, labelMaps)}
                </p>
                {secondary && (
                  <p className="truncate text-xs text-muted">{secondary}</p>
                )}
              </Link>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/admin/${table.name}/${id}`}
                  aria-label="Edit"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-card-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteRowButton tableName={table.name} id={id} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
