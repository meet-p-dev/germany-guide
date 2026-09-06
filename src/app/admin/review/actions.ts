"use server";

import { revalidatePath } from "next/cache";
import { getAdminUser } from "@/lib/admin/auth";
import { applyProposal, rejectProposal } from "@/lib/admin/proposals";
// State shapes live outside this file: a "use server" module may only export
// async functions. See the note in review-state.ts.
import type { ReviewActionState } from "@/lib/review-state";

/**
 * Approve a proposal and write it to the live content table.
 *
 * Server Actions are reachable by direct POST, not only through our UI, so the
 * admin check is repeated here even though the page renders behind the gate —
 * and `applyProposal` re-checks a third time before touching anything.
 */
export async function approveProposalAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  if (!(await getAdminUser())) {
    return { ok: false, message: "Not authorized.", submitted: true };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Missing proposal id.", submitted: true };

  const result = await applyProposal(id, {
    bumpVerified: formData.get("bump_verified") === "on",
  });

  if (result.ok) {
    // Content pages are ISR-cached; revalidate so the change is visible now
    // rather than trickling in over the hour.
    revalidatePath("/", "layout");
  }
  revalidatePath("/admin/review");

  return { ...result, submitted: true };
}

export async function rejectProposalAction(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  if (!(await getAdminUser())) {
    return { ok: false, message: "Not authorized.", submitted: true };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false, message: "Missing proposal id.", submitted: true };

  const result = await rejectProposal(id, String(formData.get("note") ?? "").trim());
  revalidatePath("/admin/review");
  return { ...result, submitted: true };
}
