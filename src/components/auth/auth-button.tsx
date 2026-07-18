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
  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Account menu for ${email}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary transition-shadow hover:shadow-sm"
      >
        {initial}
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
            <p className="flex items-center gap-2 truncate px-3 py-2 text-sm text-muted">
              <UserRound className="h-4 w-4 shrink-0" />
              {email}
            </p>
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
