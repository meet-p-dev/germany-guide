"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, Mail, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  tables: { name: string; label: string }[];
  /** Proposals awaiting review, shown as a badge so the queue is not missed. */
  pendingReviews: number;
}

export function AdminTableNav({ tables, pendingReviews }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label="Content tables" className="flex flex-col gap-0.5">
      <Link
        href="/admin"
        className={cn(
          "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
          pathname === "/admin"
            ? "bg-card-muted text-foreground"
            : "text-muted hover:bg-card-muted hover:text-foreground",
        )}
      >
        Overview
      </Link>
      {tables.map((t) => {
        const href = `/admin/${t.name}`;
        const active = pathname.startsWith(href);
        return (
          <Link
            key={t.name}
            href={href}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-card-muted text-foreground"
                : "text-muted hover:bg-card-muted hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}

      <Link
        href="/admin/review"
        className={cn(
          "mt-1 flex items-center gap-1.5 rounded-xl border-t border-border px-3 py-2 pt-3 text-sm font-medium transition-colors",
          pathname.startsWith("/admin/review")
            ? "text-foreground"
            : "text-muted hover:text-foreground",
        )}
      >
        <ClipboardCheck className="h-3.5 w-3.5 text-primary" />
        Review
        {pendingReviews > 0 ? (
          <span className="ml-auto rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-semibold leading-none text-primary-foreground">
            {pendingReviews}
          </span>
        ) : null}
      </Link>

      <Link
        href="/admin/newsletter"
        className={cn(
          "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
          pathname.startsWith("/admin/newsletter")
            ? "text-foreground"
            : "text-muted hover:text-foreground",
        )}
      >
        <Mail className="h-3.5 w-3.5 text-primary" />
        Newsletter
      </Link>

      <Link
        href="/admin/admins"
        className={cn(
          "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
          pathname.startsWith("/admin/admins")
            ? "text-foreground"
            : "text-muted hover:text-foreground",
        )}
      >
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        Admins
      </Link>
    </nav>
  );
}
