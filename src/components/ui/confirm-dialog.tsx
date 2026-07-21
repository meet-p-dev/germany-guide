"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Small modal for choices that deserve a pause — closes on Escape/backdrop.
 * Rendered through a portal: an ancestor with backdrop-filter or a transform
 * (like the sticky site header) would otherwise become the containing block
 * for position:fixed and pin the overlay inside itself.
 */
export function ConfirmDialog({
  title,
  body,
  actions,
  onClose,
}: {
  title: string;
  body: string;
  actions: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <motion.button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-xl"
      >
        <h2 className="font-display text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        <div className="mt-6 flex flex-wrap items-center gap-2">{actions}</div>
      </motion.div>
    </div>,
    document.body,
  );
}
