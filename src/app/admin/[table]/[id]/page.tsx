import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { editableFields, getTableConfig } from "@/lib/admin/schema";
import { getRow, fkOptionsForTable } from "@/lib/admin/data";
import { RecordForm } from "@/components/admin/record-form";

export default async function RecordPage({
  params,
}: {
  params: Promise<{ table: string; id: string }>;
}) {
  const { table: tableName, id } = await params;
  const table = getTableConfig(tableName);
  if (!table) notFound();

  const isNew = id === "new";
  const [initial, fkOptions] = await Promise.all([
    isNew ? Promise.resolve(null) : getRow(table, id),
    fkOptionsForTable(table),
  ]);

  if (!isNew && !initial) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href={`/admin/${table.name}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {table.label}
      </Link>

      <h1 className="mt-3 font-display text-2xl font-bold">
        {isNew ? `New ${table.singular.toLowerCase()}` : `Edit ${table.singular.toLowerCase()}`}
      </h1>

      <RecordForm
        tableName={table.name}
        singular={table.singular}
        fields={editableFields(table)}
        initial={initial}
        fkOptions={fkOptions}
      />
    </div>
  );
}
