"use client";

import { useActionState, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  ExternalLink,
  Loader2,
  Plus,
  User,
  X,
} from "lucide-react";
import {
  approveProposalAction,
  rejectProposalAction,
} from "@/app/admin/review/actions";
import {
  initialReviewActionState,
  type ReviewActionState,
} from "@/lib/review-state";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export interface ProposalCardData {
  id: string;
  op: "update" | "insert";
  tableLabel: string;
  targetLabel: string;
  fieldLabel: string | null;
  currentValue: string | null;
  proposedValue: string | null;
  payloadPreview: string | null;
  sourceUrl: string;
  sourceName: string | null;
  rationale: string | null;
  origin: string;
  runId: string | null;
  createdAt: string;
  applicable: boolean;
  driftWarning: string | null;
  /** True when the target table has a `last_verified` column to bump. */
  canBumpVerified: boolean;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * One queued change, with its before/after and its source.
 *
 * Every value here originated from a web page an agent read, so it is rendered
 * as plain text — never as Markdown or HTML. The reviewer is reading untrusted
 * text and deciding whether it is true, which is the whole point of the gate.
 */
export function ProposalCard({ data }: { data: ProposalCardData }) {
  const [rejecting, setRejecting] = useState(false);

  const [approveState, approveAction, approvePending] = useActionState(
    approveProposalAction,
    initialReviewActionState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectProposalAction,
    initialReviewActionState,
  );

  const state: ReviewActionState = rejectState.submitted ? rejectState : approveState;
  const done = state.submitted && state.ok;

  return (
    <article
      className={
        done
          ? "rounded-3xl border border-border bg-card p-5 opacity-60 transition-opacity"
          : "rounded-3xl border border-border bg-card p-5"
      }
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
              {data.op === "insert" ? (
                <>
                  <Plus aria-hidden className="size-3" />
                  New
                </>
              ) : (
                "Change"
              )}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted">
              {data.tableLabel}
            </span>
          </div>
          <h3 className="mt-1.5 font-display text-lg font-bold">
            {data.targetLabel}
            {data.fieldLabel ? (
              <span className="font-sans text-base font-normal text-muted">
                {" "}
                · {data.fieldLabel}
              </span>
            ) : null}
          </h3>
        </div>

        <div className="shrink-0 text-right">
          <p className="flex items-center justify-end gap-1.5 text-xs text-muted">
            {data.origin === "agent" ? (
              <Bot aria-hidden className="size-3.5" />
            ) : (
              <User aria-hidden className="size-3.5" />
            )}
            {DATE_FORMAT.format(new Date(data.createdAt))}
          </p>
          {data.runId ? (
            <p className="mt-0.5 font-mono text-[11px] text-muted">{data.runId}</p>
          ) : null}
        </div>
      </header>

      {data.op === "update" ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <ValueBlock label="Currently" value={data.currentValue} muted />
          <ValueBlock label="Proposed" value={data.proposedValue} />
        </div>
      ) : (
        <ValueBlock label="New record" value={data.payloadPreview} className="mt-4" />
      )}

      {data.rationale ? (
        <p className="mt-4 text-sm leading-relaxed text-muted">{data.rationale}</p>
      ) : null}

      <a
        href={data.sourceUrl}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="mt-3 inline-flex max-w-full items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        <ExternalLink aria-hidden className="size-3.5 shrink-0" />
        <span className="truncate">{data.sourceName ?? data.sourceUrl}</span>
      </a>

      {data.driftWarning ? (
        <p className="mt-4 flex items-start gap-2 rounded-2xl bg-card-muted p-3 text-sm text-foreground">
          <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          {data.driftWarning}
        </p>
      ) : null}

      {!done ? (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <form action={approveAction} className="flex flex-wrap items-center gap-3">
            <input type="hidden" name="id" value={data.id} />
            <Button
              type="submit"
              size="sm"
              disabled={approvePending || rejectPending || !data.applicable}
            >
              {approvePending ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" />
                  Applying
                </>
              ) : (
                <>
                  <Check aria-hidden className="size-4" />
                  Approve &amp; publish
                </>
              )}
            </Button>

            {data.canBumpVerified ? (
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  name="bump_verified"
                  defaultChecked
                  className="size-4 accent-[var(--primary)]"
                />
                I checked the source. Set today as{" "}
                <code className="rounded bg-card-muted px-1 py-0.5 text-xs">
                  last_verified
                </code>
              </label>
            ) : null}
          </form>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={approvePending || rejectPending}
            onClick={() => setRejecting(true)}
          >
            <X aria-hidden className="size-4" />
            Reject
          </Button>
        </div>
      ) : null}

      {rejecting ? (
        <ConfirmDialog
          title="Reject this proposal?"
          body="It stays in the log with your note, and nothing on the site changes."
          onClose={() => setRejecting(false)}
          actions={
            <>
              <form
                action={rejectAction}
                onSubmit={() => setRejecting(false)}
                className="flex flex-col gap-3"
              >
                <input type="hidden" name="id" value={data.id} />
                <input
                  type="text"
                  name="note"
                  placeholder="Why? (optional)"
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-base"
                />
                <Button type="submit" size="sm">
                  Reject it
                </Button>
              </form>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setRejecting(false)}
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
    </article>
  );
}

function ValueBlock({
  label,
  value,
  muted = false,
  className = "",
}: {
  label: string;
  value: string | null;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <pre
        className={
          muted
            ? "mt-1.5 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-card-muted p-3 font-sans text-sm text-muted"
            : "mt-1.5 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-card-muted p-3 font-sans text-sm text-foreground"
        }
      >
        {value && value.length > 0 ? value : "(empty)"}
      </pre>
    </div>
  );
}
