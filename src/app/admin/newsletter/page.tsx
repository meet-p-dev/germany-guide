import type { Metadata } from "next";
import { AlertTriangle, Mail } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { pendingDigestItems } from "@/lib/email/digest";
import { emailConfigured } from "@/lib/email/send";
import { createServiceClient, hasServiceRole } from "@/lib/supabase/service-client";
import { DigestButtons } from "@/components/admin/digest-buttons";

export const metadata: Metadata = {
  title: "Newsletter",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

interface Counts {
  confirmed: number;
  pending: number;
  unsubscribed: number;
}

async function loadCounts(): Promise<Counts> {
  const db = createServiceClient();
  const [confirmed, pending, unsubscribed] = await Promise.all(
    (["confirmed", "pending", "unsubscribed"] as const).map((status) =>
      db
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", status),
    ),
  );
  return {
    confirmed: confirmed.count ?? 0,
    pending: pending.count ?? 0,
    unsubscribed: unsubscribed.count ?? 0,
  };
}

export default async function AdminNewsletterPage() {
  await requireAdmin();

  const ready = hasServiceRole() && emailConfigured();

  if (!ready) {
    return (
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h1 className="font-display text-xl font-bold">
              Newsletter is not switched on
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Two environment variables are needed in Vercel (Production):
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              <li>
                <code className="rounded bg-card-muted px-1.5 py-0.5 text-xs">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>{" "}
                — {hasServiceRole() ? "set" : "missing"}
              </li>
              <li>
                <code className="rounded bg-card-muted px-1.5 py-0.5 text-xs">
                  RESEND_API_KEY
                </code>{" "}
                — {emailConfigured() ? "set" : "missing"}
              </li>
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Until both are set, the signup forms tell visitors the feature is
              not available rather than silently losing their address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const db = createServiceClient();
  const [counts, items, { data: sends }] = await Promise.all([
    loadCounts(),
    pendingDigestItems(),
    db
      .from("newsletter_sends")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Newsletter</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          The digest goes out automatically on the 1st of each month, carrying
          every update not yet delivered. It skips itself when nothing is new.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Confirmed" value={counts.confirmed} accent />
        <Stat label="Awaiting confirmation" value={counts.pending} />
        <Stat label="Unsubscribed" value={counts.unsubscribed} />
      </section>

      <section className="rounded-3xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <Mail aria-hidden className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-bold">
              {items.length === 0
                ? "Nothing waiting to go out"
                : `${items.length} update${items.length === 1 ? "" : "s"} waiting`}
            </h2>
            {items.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {items.map((item) => (
                  <li key={item.slug} className="text-sm text-foreground">
                    {item.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Every published update has already been delivered. Add one in
                the Updates table and it joins the next digest.
              </p>
            )}
            <DigestButtons hasPending={items.length > 0} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Recent runs</h2>
        {sends && sends.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-muted">
                <tr>
                  <th className="pb-2 pr-4 font-semibold">When</th>
                  <th className="pb-2 pr-4 font-semibold">Status</th>
                  <th className="pb-2 pr-4 font-semibold">Sent</th>
                  <th className="pb-2 font-semibold">Subject</th>
                </tr>
              </thead>
              <tbody>
                {sends.map((send) => (
                  <tr key={send.id} className="border-t border-border">
                    <td className="py-2.5 pr-4 whitespace-nowrap text-muted">
                      {DATE_FORMAT.format(new Date(send.sent_at))}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={
                          send.status === "sent"
                            ? "font-medium text-[var(--success)]"
                            : send.status === "skipped"
                              ? "text-muted"
                              : "font-medium text-primary"
                        }
                      >
                        {send.status}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-muted">
                      {send.recipient_count}
                      {send.failed_count > 0
                        ? ` (${send.failed_count} failed)`
                        : ""}
                    </td>
                    <td className="py-2.5 text-foreground">{send.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted">
            No digest has run yet. The first one fires on the 1st, or press
            &ldquo;Send now&rdquo; above.
          </p>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p
        className={
          accent
            ? "font-display text-3xl font-bold text-primary"
            : "font-display text-3xl font-bold text-foreground"
        }
      >
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-wider text-muted">{label}</p>
    </div>
  );
}
