"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import {
  addAdminByEmail,
  removeAdmin,
  type ActionState,
} from "@/app/admin/actions";
import type { AdminEntry } from "@/lib/admin/auth";

interface Props {
  admins: AdminEntry[];
  currentUserId: string;
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60";

function AddAdminForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    addAdminByEmail,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <UserPlus className="h-4 w-4 text-primary" />
        Add an admin
      </p>
      <p className="mt-1 text-xs text-muted">
        They must already have a Germany Guide account. Adding grants full access
        to edit all site content.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="person@example.com"
          className={inputCls}
        />
        <input
          type="text"
          name="note"
          placeholder="Note (optional)"
          className={`${inputCls} sm:max-w-[12rem]`}
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add admin"}
        </button>
      </div>
      {state.error && !state.ok && (
        <p className="mt-2 flex items-start gap-1.5 text-xs font-medium text-primary">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success">
          <Check className="h-3.5 w-3.5" />
          Admin added.
        </p>
      )}
    </form>
  );
}

function RemoveAdminButton({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    removeAdmin,
    { ok: false },
  );

  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        const msg = isSelf
          ? "Remove yourself as admin? You'll lose access to this area immediately."
          : "Remove this admin?";
        if (!window.confirm(msg)) e.preventDefault();
      }}
      className="shrink-0"
    >
      <input type="hidden" name="user_id" value={userId} />
      <button
        type="submit"
        disabled={pending}
        aria-label="Remove admin"
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {pending ? "Removing…" : "Remove"}
      </button>
      {state.error && !state.ok && (
        <p className="mt-1 text-right text-xs text-primary">{state.error}</p>
      )}
    </form>
  );
}

export function AdminManager({ admins, currentUserId }: Props) {
  const isLastAdmin = admins.length <= 1;

  return (
    <div className="mt-6 space-y-6">
      <AddAdminForm />

      <div>
        <p className="mb-2 text-sm font-medium text-muted">
          {admins.length} {admins.length === 1 ? "admin" : "admins"}
        </p>
        <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {admins.map((admin) => {
            const isSelf = admin.user_id === currentUserId;
            return (
              <li
                key={admin.user_id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {admin.email}
                      {isSelf && (
                        <span className="ml-2 rounded-full bg-card-muted px-2 py-0.5 text-xs font-normal text-muted">
                          You
                        </span>
                      )}
                    </p>
                    {admin.note && (
                      <p className="truncate text-xs text-muted">{admin.note}</p>
                    )}
                  </div>
                </div>
                {isLastAdmin ? (
                  <span className="shrink-0 text-xs text-muted">Last admin</span>
                ) : (
                  <RemoveAdminButton userId={admin.user_id} isSelf={isSelf} />
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-muted">
          The last remaining admin can’t be removed, so you can never lock
          yourself out.
        </p>
      </div>
    </div>
  );
}
