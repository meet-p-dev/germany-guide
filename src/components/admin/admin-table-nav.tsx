"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  tables: { name: string; label: string }[];
}

export function AdminTableNav({ tables }: Props) {
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
        href="/admin/admins"
        className={cn(
          "mt-1 flex items-center gap-1.5 rounded-xl border-t border-border px-3 py-2 pt-3 text-sm font-medium transition-colors",
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
