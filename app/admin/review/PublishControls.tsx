"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { archiveRow, publishRow } from "./actions";

export function PublishControls({
  table,
  id,
}: {
  table: "guides" | "city_task_variants" | "problems" | "letters" | "glossary_terms";
  id: string;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return (
      <p className="flex items-center gap-1.5 text-sm font-medium text-gg-progress-text">
        {done === "Published" && <Check className="h-4 w-4" aria-hidden="true" />}
        {done}
      </p>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await publishRow(table, id);
            setDone("Published");
          })
        }
      >
        {pending ? "…" : "Publish"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await archiveRow(table, id);
            setDone("Archived");
          })
        }
      >
        Archive
      </Button>
    </div>
  );
}
