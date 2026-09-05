"use server";

import {
  getSubscriptionStateForEmail,
  newsletterConfigured,
  subscribe,
  unsubscribeByEmail,
  type ConsentSource,
} from "@/lib/newsletter";
// State shapes live outside this file: a "use server" module may only export
// async functions. See the note in newsletter-state.ts.
import type {
  MyNewsletterState,
  SubscribeState,
} from "@/lib/newsletter-state";
import { createAuthServerClient } from "@/lib/supabase/server-client";

const SOURCES: ConsentSource[] = ["footer", "updates", "account"];

function readSource(value: FormDataEntryValue | null): ConsentSource {
  const raw = String(value ?? "");
  return (SOURCES as string[]).includes(raw) ? (raw as ConsentSource) : "footer";
}

/**
 * Public subscribe form. Server Actions are reachable by direct POST, so every
 * check that matters happens here rather than in the component.
 */
export async function subscribeAction(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  // Honeypot: a field hidden from people and irresistible to naive bots.
  if (String(formData.get("company") ?? "").trim() !== "") {
    // Answer as if it worked; a bot should learn nothing from the difference.
    return { ok: true, message: "Check your inbox to confirm.", submitted: true };
  }

  const email = String(formData.get("email") ?? "");
  const consent = formData.get("consent");
  if (!consent) {
    return {
      ok: false,
      message: "Please tick the consent box so we know it is what you want.",
      submitted: true,
    };
  }

  const result = await subscribe({ email, source: readSource(formData.get("source")) });
  return { ...result, submitted: true };
}

/** Current subscription state for the signed-in user, for the /account toggle. */
export async function getMyNewsletterState(): Promise<MyNewsletterState> {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { state: "none", available: false, email: null };
  }
  if (!newsletterConfigured()) {
    return { state: "none", available: false, email: user.email };
  }

  return {
    state: await getSubscriptionStateForEmail(user.email),
    available: true,
    email: user.email,
  };
}

/**
 * Subscribe from /account, where the session supplies the address — a signed-in
 * user cannot use this to sign anyone else up. Still double opt-in: consent has
 * to be proven from the mailbox, not from a logged-in tab.
 */
export async function subscribeCurrentUserAction(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return { ok: false, message: "Please sign in first.", submitted: true };
  }

  const wantsOff = String(formData.get("intent") ?? "") === "unsubscribe";

  if (wantsOff) {
    const done = await unsubscribeByEmail(user.email);
    return {
      ok: done,
      message: done
        ? "Unsubscribed. You will not get the update email again."
        : "Could not update that just now. Please try again.",
      submitted: true,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("city_slug")
    .eq("id", user.id)
    .maybeSingle();

  const result = await subscribe({
    email: user.email,
    source: "account",
    userId: user.id,
    citySlug: profile?.city_slug ?? null,
  });
  return { ...result, submitted: true };
}
