"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { useVisitorProfile } from "@/lib/profile-store";
import { cn } from "@/lib/utils";

export function AuthButton() {
  const { ready, session, signOut } = useVisitorProfile();
  const [open, setOpen] = useState(false);

  if (!ready || !session) {
    return (
      <Link
        href="/signin"
        className={cn(
          "hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:block",
          !ready && "invisible",
        )}
      >
        Sign in
      </Link>
    );
  }

  const email = session.user.email ?? "Account";
  const name =
    (session.user.user_metadata.full_name as string | undefined) ??
    (session.user.user_metadata.name as string | undefined) ??
    null;
  const avatarUrl = session.user.user_metadata.avatar_url as string | undefined;
  const initial = (name ?? email).charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Account menu for ${name ?? email}`}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-sm font-bold text-primary transition-shadow hover:shadow-sm"
      >
        {avatarUrl ? (
          // Off-domain OAuth avatar with no known host list — next/image
          // remote patterns can't cover every provider CDN.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-64 rounded-2xl border border-border bg-card p-2 shadow-lg"
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <UserRound className="h-4 w-4 shrink-0 text-muted" />
              <div className="min-w-0">
                {name && (
                  <p className="truncate text-sm font-medium">{name}</p>
                )}
                <p className="truncate text-xs text-muted">{email}</p>
              </div>
            </div>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-card-muted"
            >
              <LayoutDashboard className="h-4 w-4" />
              My account
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-card-muted"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
