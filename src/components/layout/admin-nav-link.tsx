"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useVisitorProfile } from "@/lib/profile-store";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { cn } from "@/lib/utils";

/**
 * Admin entry point in the header. Rendered only for signed-in admins, checked
 * client-side via `is_admin()` so it doesn't force the (otherwise static)
 * layout to read cookies on every request. The database still gates /admin.
 */
export function AdminNavLink({
  variant = "desktop",
  onNavigate,
}: {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}) {
  const { session } = useVisitorProfile();
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!session) return;
    let active = true;
    void getBrowserClient()
      .rpc("is_admin")
      .then(({ data }) => {
        if (active) setIsAdmin(data === true);
      });
    return () => {
      active = false;
    };
  }, [session]);

  // Gate on session too, so the link disappears immediately on sign-out even
  // before the (session-less) effect re-runs.
  if (!session || !isAdmin) return null;

  const active = pathname.startsWith("/admin");

  if (variant === "mobile") {
    return (
      <Link
        href="/admin"
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[15px] font-medium text-foreground hover:bg-card-muted"
      >
        <ShieldCheck className="h-4 w-4 text-primary" />
        Admin
      </Link>
    );
  }

  return (
    <Link
      href="/admin"
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-card-muted text-foreground"
          : "text-muted hover:bg-card-muted hover:text-foreground",
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5 text-primary" />
      Admin
    </Link>
  );
}
