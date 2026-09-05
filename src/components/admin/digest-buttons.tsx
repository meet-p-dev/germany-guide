"use client";

import { useActionState, useState } from "react";
import { Loader2, Send, TestTube } from "lucide-react";
import {
  sendDigestNowAction,
  sendTestDigestAction,
} from "@/app/admin/newsletter/actions";
import {
  initialDigestActionState,
  type DigestActionState,
} from "@/lib/newsletter-state";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function DigestButtons({ hasPending }: { hasPending: boolean }) {
  const [confirming, setConfirming] = useState(false);

  const [testState, testAction, testPending] = useActionState(
    sendTestDigestAction,
    initialDigestActionState,
  );
  const [sendState, sendAction, sendPending] = useActionState(
    sendDigestNowAction,
    initialDigestActionState,
  );

  // Whichever ran most recently is the one worth reporting.
  const state: DigestActionState = sendState.submitted ? sendState : testState;

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-3">
        <form action={testAction}>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={testPending || !hasPending}
          >
            {testPending ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Sending
              </>
            ) : (
              <>
                <TestTube aria-hidden className="size-4" />
                Send a test to me
              </>
            )}
          </Button>
        </form>

        <Button
          type="button"
          size="sm"
          disabled={sendPending || !hasPending}
          onClick={() => setConfirming(true)}
        >
          {sendPending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Sending
            </>
          ) : (
            <>
              <Send aria-hidden className="size-4" />
              Send now
            </>
          )}
        </Button>
      </div>

      {confirming ? (
        <ConfirmDialog
          title="Send the digest now?"
          body="This emails every confirmed subscriber immediately and marks these updates as delivered. The monthly cron would do it on its own on the 1st."
          onClose={() => setConfirming(false)}
          actions={
            <>
              <form action={sendAction} onSubmit={() => setConfirming(false)}>
                <Button type="submit" size="sm">
                  Send it
                </Button>
              </form>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </>
          }
        />
      ) : null}

      {state.submitted && state.message ? (
        <p
          role="status"
          className={
            state.ok
              ? "mt-4 text-sm text-muted"
              : "mt-4 text-sm font-medium text-primary"
          }
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
