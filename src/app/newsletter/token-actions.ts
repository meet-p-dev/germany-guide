"use server";

import { confirmSubscription, unsubscribeByToken } from "@/lib/newsletter";
// State shapes live outside this file: a "use server" module may only export
// async functions. See the note in newsletter-state.ts.
import type { TokenState } from "@/lib/newsletter-state";

/**
 * Both flows finish on a button press rather than on page load.
 *
 * The reason is prefetching: corporate mail scanners (Outlook Safe Links and
 * friends) fetch every URL in an email before the reader ever sees it. A
 * confirm-on-GET would let a scanner manufacture consent nobody gave, and an
 * unsubscribe-on-GET would silently drop people off the list. A POST from a
 * real click is not something a link scanner performs.
 */

export async function confirmAction(
  _prev: TokenState,
  formData: FormData,
): Promise<TokenState> {
  const token = String(formData.get("token") ?? "");
  return { outcome: await confirmSubscription(token) };
}

export async function unsubscribeAction(
  _prev: TokenState,
  formData: FormData,
): Promise<TokenState> {
  const token = String(formData.get("token") ?? "");
  return { outcome: await unsubscribeByToken(token) };
}
