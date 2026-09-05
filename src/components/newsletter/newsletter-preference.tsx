"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import {
  getMyNewsletterState,
  subscribeCurrentUserAction,
} from "@/app/newsletter/actions";
import {
  initialSubscribeState,
  type MyNewsletterState,
  type SubscribeState,
} from "@/lib/newsletter-state";
import { Button } from "@/components/ui/button";

const STATUS_COPY: Record<string, string> = {
  confirmed: "You are getting the update email.",
  pending:
    "Almost there — open the confirmation email we sent and press the button in it.",
  unsubscribed: "You are not getting the update email.",
  none: "You are not getting the update email.",
};

/**
 * Opt-in toggle on /account.
 *
 * Being signed in is not consent to be emailed marketing, so this still runs
 * the full double opt-in: pressing the button sends a confirmation mail rather
 * than switching the subscription on.
 */
export function NewsletterPreference() {
  const [current, setCurrent] = useState<MyNewsletterState | null>(null);
  const [state, formAction, pending] = useActionState<SubscribeState, FormData>(
    subscribeCurrentUserAction,
    initialSubscribeState,
  );

  useEffect(() => {
    let active = true;
    getMyNewsletterState()
      .then((value) => {
        if (active) setCurrent(value);
      })
      .catch(() => {
        if (active) setCurrent({ state: "none", available: false, email: null });
      });
    return () => {
      active = false;
    };
  }, [state.submitted]);

  if (!current) {
    return (
      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Loader2 aria-hidden className="size-4 animate-spin" />
          Loading your email preference
        </div>
      </section>
    );
  }

  const subscribed = current.state === "confirmed";

  return (
    <section className="mt-6 rounded-3xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <Mail aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold text-foreground">
            Update email
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            A short note when German fees, rules or city procedures change —
            roughly monthly, never more. Separate from your account: turning it
            off changes nothing else.
          </p>

          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
            {subscribed ? (
              <Check aria-hidden className="size-4 text-[var(--success)]" />
            ) : null}
            {STATUS_COPY[current.state] ?? STATUS_COPY.none}
          </p>

          {current.available ? (
            <form action={formAction} className="mt-4">
              <input
                type="hidden"
                name="intent"
                value={subscribed ? "unsubscribe" : "subscribe"}
              />
              <Button
                type="submit"
                size="sm"
                variant={subscribed ? "secondary" : "primary"}
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 aria-hidden className="size-4 animate-spin" />
                    Working
                  </>
                ) : subscribed ? (
                  "Turn it off"
                ) : (
                  "Send me updates"
                )}
              </Button>
            </form>
          ) : (
            <p className="mt-4 text-xs text-muted">
              The update email is not switched on yet. Nothing to do here for
              now.
            </p>
          )}

          {state.submitted && state.message ? (
            <p
              role="status"
              className={
                state.ok
                  ? "mt-3 text-xs leading-relaxed text-muted"
                  : "mt-3 text-xs font-medium text-primary"
              }
            >
              {state.message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
