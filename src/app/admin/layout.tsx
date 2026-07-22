import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { ADMIN_TABLES } from "@/lib/admin/schema";
import { AdminTableNav } from "@/components/admin/admin-table-nav";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Auth-dependent — never statically cache the admin shell.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 404s for anyone who is not a signed-in admin: the area is invisible.
  const user = await requireAdmin();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <div>
            <p className="font-display text-lg font-bold leading-none">
              Content admin
            </p>
            <p className="mt-1 text-xs text-muted">{user.email}</p>
          </div>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
        <AdminTableNav tables={ADMIN_TABLES.map((t) => ({ name: t.name, label: t.label }))} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
