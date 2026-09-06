import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import {
  decorateProposals,
  listProposals,
  type ProposalStatus,
  type ProposalView,
} from "@/lib/admin/proposals";
import { getTableConfig } from "@/lib/admin/schema";
import {
  ProposalCard,
  type ProposalCardData,
} from "@/components/admin/proposal-card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Review queue",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TABS: { status: ProposalStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "applied", label: "Applied" },
  { status: "rejected", label: "Rejected" },
  { status: "stale", label: "Stale" },
];

function toCardData(p: ProposalView): ProposalCardData {
  const table = getTableConfig(p.target_table);
  return {
    id: p.id,
    op: p.op,
    tableLabel: p.tableLabel,
    targetLabel: p.targetLabel,
    fieldLabel: p.fieldLabel,
    currentValue: p.current_value,
    proposedValue: p.proposed_value,
    payloadPreview: p.payload ? JSON.stringify(p.payload, null, 2) : null,
    sourceUrl: p.source_url,
    sourceName: p.source_name,
    rationale: p.rationale,
    origin: p.origin,
    runId: p.run_id,
    createdAt: p.created_at,
    applicable: p.applicable,
    driftWarning: p.driftWarning,
    canBumpVerified: Boolean(
      table?.fields.some((f) => f.name === "last_verified"),
    ),
  };
}

export default async function AdminReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const { status: statusParam } = await searchParams;
  const status: ProposalStatus =
    TABS.find((t) => t.status === statusParam)?.status ?? "pending";

  const proposals = await decorateProposals(await listProposals(status));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Review queue</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Scheduled agents research changes from official sources and queue them
          here. Nothing reaches the site until you approve it — read the source,
          then publish or reject.
        </p>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.status}
            href={`/admin/review?status=${tab.status}`}
            aria-current={tab.status === status ? "page" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              tab.status === status
                ? "border-foreground/25 bg-card-muted text-foreground"
                : "border-border text-muted hover:border-foreground/25 hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {proposals.length === 0 ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-center">
          {status === "pending" ? (
            <>
              <CheckCircle2
                aria-hidden
                className="mx-auto size-8 text-[var(--success)]"
              />
              <h2 className="mt-3 font-display text-lg font-bold">
                Nothing waiting for you
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                When an agent finds a changed fee, a moved office or a dead link,
                it lands here with its source for you to check.
              </p>
            </>
          ) : (
            <>
              <ClipboardCheck aria-hidden className="mx-auto size-8 text-muted" />
              <p className="mt-3 text-sm text-muted">
                No {status} proposals.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => (
            <ProposalCard key={p.id} data={toCardData(p)} />
          ))}
        </div>
      )}
    </div>
  );
}
