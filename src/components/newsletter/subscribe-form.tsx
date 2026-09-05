"use client";

import { useActionState, useId } from "react";
import { Check, Loader2, Mail } from "lucide-react";
import { subscribeAction } from "@/app/newsletter/actions";
import {
  initialSubscribeState,
  type SubscribeState,
} from "@/lib/newsletter-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Double opt-in signup. The consent checkbox is deliberately unticked and
 * required: pre-ticked boxes are not valid consent under the GDPR, so it must
 * be an action the reader takes.
 */
export function SubscribeForm({
  source,
  className,
  compact = false,
}: {
  source: "footer" | "updates";
  className?: string;
  /** Footer variant: tighter, no heading of its own. */
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState<SubscribeState, FormData>(
    subscribeAction,
    initialSubscribeState,
  );
  const emailId = useId();
  const consentId = useId();

  if (state.submitted && state.ok) {
    return (
      <div
        className={cn(
          "flex items-start gap-3 rounded-2xl border border-border bg-card p-4",
          className,
        )}
        role="status"
      >
        <Check
          aria-hidden
          className="mt-0.5 size-5 shrink-0 text-[var(--success)]"
        />
        <p className="text-sm leading-relaxed text-foreground">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className={cn("space-y-3", className)}>
      <input type="hidden" name="source" value={source} />

      {/* Honeypot — hidden from people, tempting to bots. Not display:none, which
          some bots detect; off-screen with tab and autofill disabled. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${emailId}-company`}>Company</label>
        <input
          id={`${emailId}-company`}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className={cn("flex gap-2", compact ? "flex-col sm:flex-row" : "flex-col sm:flex-row")}>
        <div className="flex-1">
          <label htmlFor={emailId} className="sr-only">
            Your email address
          </label>
          <div className="relative">
            <Mail
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
            />
            <input
              id={emailId}
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-[16px] text-foreground placeholder:text-muted focus:border-primary focus:outline-2 focus:outline-offset-2 focus:outline-primary"
            />
          </div>
        </div>
        <Button type="submit" disabled={pending} className="shrink-0">
          {pending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Sending
            </>
          ) : (
            "Get updates"
          )}
        </Button>
      </div>

      <div className="flex items-start gap-2.5">
        <input
          id={consentId}
          type="checkbox"
          name="consent"
          value="yes"
          required
          className="mt-0.5 size-4 shrink-0 rounded border-border accent-[var(--primary)]"
        />
        <label
          htmlFor={consentId}
          className="text-xs leading-relaxed text-muted"
        >
          Email me when German fees, rules or city procedures change. Roughly
          monthly, never more. Unsubscribe in one click from any email.
        </label>
      </div>

      {state.submitted && !state.ok && state.message ? (
        <p role="alert" className="text-xs font-medium text-primary">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
