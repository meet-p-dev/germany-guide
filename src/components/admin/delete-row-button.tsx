"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteRow, type ActionState } from "@/app/admin/actions";

interface Props {
  tableName: string;
  id: string;
  /** Render a labelled button (form footer) rather than an icon (list row). */
  withLabel?: boolean;
  /** After delete, go to the table list instead of refreshing in place. */
  redirectToList?: boolean;
}

export function DeleteRowButton({ tableName, id, withLabel, redirectToList }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deleteRow,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) {
      if (redirectToList) router.push(`/admin/${tableName}`);
      router.refresh();
    }
  }, [state.ok, router, tableName, redirectToList]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm("Delete this row? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="__table" value={tableName} />
      <input type="hidden" name="__id" value={id} />
      {withLabel ? (
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          {pending ? "Deleting…" : "Delete"}
        </button>
      ) : (
        <button
          type="submit"
          aria-label="Delete"
          disabled={pending}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary-soft hover:text-primary disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      {state.error && !state.ok && (
        <p className="mt-1 text-xs text-primary">{state.error}</p>
      )}
    </form>
  );
}
