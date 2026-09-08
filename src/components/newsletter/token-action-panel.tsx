"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { confirmAction, unsubscribeAction } from "@/app/newsletter/token-actions";
import { initialTokenState, type TokenState } from "@/lib/newsletter-state";
import { Button, ButtonLink } from "@/components/ui/button";

type Mode = "confirm" | "unsubscribe";

const COPY: Record<
  Mode,
  {
    heading: string;
    lead: string;
    cta: string;
    outcomes: Record<string, { heading: string; body: string }>;
  }
> = {
  confirm: {
    heading: "Confirm your subscription",
    lead: "One press and you are on the list. You will get a short note when German fees, rules or city procedures change, roughly monthly, and you can leave in one click from any email.",
    cta: "Confirm my subscription",
    outcomes: {
      confirmed: {
        heading: "You are subscribed",
        body: "We will write when something actually changes: fee updates, new rules, procedures that move. Nothing else.",
      },
      already: {
        heading: "Already confirmed",
        body: "This address is on the list, so there is nothing more to do.",
      },
      invalid: {
        heading: "That link did not work",
        body: "It may have already been used, or it was only partly copied. Subscribing again from the site sends a fresh link.",
      },
      unavailable: {
        heading: "Something went wrong",
        body: "We could not reach the subscription list just now. Please try the link again in a few minutes.",
      },
    },
  },
  unsubscribe: {
    heading: "Unsubscribe from updates",
    lead: "Press below and we will stop sending the update email. Your account, if you have one, is untouched.",
    cta: "Unsubscribe me",
    outcomes: {
      unsubscribed: {
        heading: "Unsubscribed",
        body: "That address will not get the update email again. The guide stays free to read whenever you need it.",
      },
      already: {
        heading: "Already unsubscribed",
        body: "This address is not on the list, so there was nothing to remove.",
      },
      invalid: {
        heading: "That link did not work",
        body: "It may have been only partly copied. Any newsletter we sent has a working unsubscribe link at the bottom.",
      },
      unavailable: {
        heading: "Something went wrong",
        body: "We could not reach the subscription list just now. Please try the link again in a few minutes.",
      },
    },
  },
};

export function TokenActionPanel({
  mode,
  token,
}: {
  mode: Mode;
  token: string;
}) {
  const [state, formAction, pending] = useActionState<TokenState, FormData>(
    mode === "confirm" ? confirmAction : unsubscribeAction,
    initialTokenState,
  );
  const copy = COPY[mode];

  if (state.outcome !== "idle") {
    const done = copy.outcomes[state.outcome] ?? copy.outcomes.unavailable;
    const good =
      state.outcome === "confirmed" ||
      state.outcome === "unsubscribed" ||
      state.outcome === "already";
    return (
      <div className="rounded-3xl border border-border bg-card p-8">
        {good ? (
          <Check aria-hidden className="size-7 text-[var(--success)]" />
        ) : null}
        <h1 className="font-display mt-3 text-2xl font-bold text-foreground">
          {done.heading}
        </h1>
        <p className="mt-3 leading-relaxed text-muted">{done.body}</p>
        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/updates" variant="secondary">
            Read the latest updates
          </ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Back to the guide
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8">
        <h1 className="font-display text-2xl font-bold text-foreground">
          That link is missing its code
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          The address may have been cut short when it was copied. Open the link
          from the email again, or{" "}
          <Link href="/updates" className="font-medium text-primary hover:underline">
            subscribe again from the updates page
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-8">
      <h1 className="font-display text-2xl font-bold text-foreground">
        {copy.heading}
      </h1>
      <p className="mt-3 leading-relaxed text-muted">{copy.lead}</p>
      <form action={formAction} className="mt-7">
        <input type="hidden" name="token" value={token} />
        <Button type="submit" disabled={pending}>
          {pending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Working
            </>
          ) : (
            copy.cta
          )}
        </Button>
      </form>
    </div>
  );
}
