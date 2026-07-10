"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV } from "@/lib/nav";

const BUILD_PLAN_HREF = "/explore";

/** Hamburger menu for small screens (the desktop pill nav is hidden under md). */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <>
          {/* Click-away backdrop */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 top-full z-50 border-b border-border/60 bg-background shadow-lg">
            <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold hover:bg-secondary"
                >
                  <Icon className="h-4 w-4 text-muted-foreground" /> {label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border/60 pt-3">
                <Button
                  asChild
                  className="w-full rounded-full font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <Link href={BUILD_PLAN_HREF}>Build my plan</Link>
                </Button>
                <Link
                  href="/auth/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Sign in
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
