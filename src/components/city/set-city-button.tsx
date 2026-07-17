"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, MapPin } from "lucide-react";
import { useVisitorProfile } from "@/lib/profile-store";
import { cn } from "@/lib/utils";

export function SetCityButton({
  citySlug,
  cityName,
}: {
  citySlug: string;
  cityName: string;
}) {
  const { ready, profile, setProfile } = useVisitorProfile();
  const isMine = profile.citySlug === citySlug;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      disabled={!ready}
      onClick={() => setProfile({ citySlug: isMine ? null : citySlug })}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border px-5 text-[15px] font-medium transition-all",
        isMine
          ? "border-success bg-success-soft text-success"
          : "border-border bg-card hover:border-foreground/30 hover:shadow-sm",
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isMine ? (
          <motion.span
            key="mine"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Check className="h-4 w-4" />
          </motion.span>
        ) : (
          <motion.span
            key="not-mine"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <MapPin className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
      {isMine ? `${cityName} is my city` : `Set ${cityName} as my city`}
    </motion.button>
  );
}
