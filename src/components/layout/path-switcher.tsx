"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Check,
  ChevronDown,
  Compass,
  GraduationCap,
} from "lucide-react";
import type { Persona } from "@/lib/content";
import { useVisitorProfile } from "@/lib/profile-store";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

const PATHS: { value: Persona; icon: typeof GraduationCap; label: string }[] = [
  { value: "student", icon: GraduationCap, label: "Student" },
  { value: "worker", icon: Briefcase, label: "Skilled worker" },
];

/**
 * The one permanent place to change your path. Once a visitor has chosen
 * student or worker, no page asks again — this switcher in the header is
 * where the choice lives, always visible, changeable anytime.
 */
export function PathSwitcher({ className }: { className?: string }) {
  const { ready, profile, progress, setProfile, resetProgress } =
    useVisitorProfile();
  const [open, setOpen] = useState(false);
  /** Set when switching would carry ticked steps across to the other path. */
  const [pendingPersona, setPendingPersona] = useState<Persona | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const doneCount = Object.keys(progress).length;

  const choosePersona = (value: Persona) => {
    setOpen(false);
    if (value === profile.persona) return;
    // Same guard as the plan wizard: ticked steps may belong to the old
    // path, so the visitor decides whether they come along.
    if (doneCount > 0) {
      setPendingPersona(value);
      return;
    }
    setProfile({ persona: value });
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Nothing chosen yet — the plan wizard and path cards handle the first
  // pick; a switcher with nothing to switch would only add noise.
  if (!ready || profile.persona === null) return null;

  const current = PATHS.find((p) => p.value === profile.persona)!;
  const CurrentIcon = current.icon;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Your path: ${current.label}. Change path`}
        className="flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <CurrentIcon className="h-4 w-4 text-primary" />
        <span className="hidden md:inline">{current.label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <motion.div
          role="menu"
          aria-label="Change your path"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-11 z-50 w-60 rounded-2xl border border-border bg-card p-2 shadow-lg"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">
            I&apos;m coming as a…
          </p>
          {PATHS.map((path) => {
            const Icon = path.icon;
            const selected = profile.persona === path.value;
            return (
              <button
                key={path.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => choosePersona(path.value)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  selected
                    ? "bg-primary-soft text-primary"
                    : "hover:bg-card-muted",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{path.label}</span>
                {selected && <Check className="h-4 w-4 shrink-0" />}
              </button>
            );
          })}
          <div className="my-1.5 border-t border-border" />
          <Link
            href="/guide/understand-your-paths"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-card-muted hover:text-foreground"
          >
            <Compass className="h-4 w-4 shrink-0" />
            Not sure? Compare the two paths
          </Link>
        </motion.div>
      )}

      {pendingPersona && (
        <ConfirmDialog
          title={`Switch to the ${
            pendingPersona === "student" ? "student" : "skilled worker"
          } path?`}
          body={`You have ${doneCount} ${
            doneCount === 1 ? "step" : "steps"
          } ticked. Some may belong to your current path. Start the new path with a clean checklist, or keep your ticks if they still apply.`}
          onClose={() => setPendingPersona(null)}
          actions={
            <>
              <Button
                size="sm"
                onClick={() => {
                  resetProgress();
                  setProfile({ persona: pendingPersona });
                  setPendingPersona(null);
                }}
              >
                Start fresh
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setProfile({ persona: pendingPersona });
                  setPendingPersona(null);
                }}
              >
                Keep my progress
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPendingPersona(null)}
              >
                Cancel
              </Button>
            </>
          }
        />
      )}
    </div>
  );
}
