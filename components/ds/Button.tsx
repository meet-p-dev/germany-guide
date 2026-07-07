import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

/**
 * Design-system button (Increment 0).
 * Two variants only, to enforce Part-1 Rule 1 (one primary action per screen):
 *  - primary:   the single Guide-Blue call to action. Use once per screen.
 *  - secondary: visually quieter — everything that isn't the main action.
 * Both render correctly in light and dark via the gg-* tokens.
 */
type Variant = "primary" | "secondary";
type Size = "md" | "sm";

const base =
  "inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-[10px] font-medium " +
  "transition-[filter,background-color] outline-none focus-visible:ring-2 focus-visible:ring-gg-brand " +
  "focus-visible:ring-offset-2 focus-visible:ring-offset-gg-surface disabled:pointer-events-none " +
  "disabled:opacity-50 [&_svg]:size-[1.1em] [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-gg-brand text-gg-brand-fg hover:brightness-[0.94] active:brightness-90 shadow-sm",
  secondary:
    "bg-gg-secondary text-gg-ink border border-gg-border hover:brightness-[0.97] active:brightness-95",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  sm: "h-9 px-4 text-sm",
};

export function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="gg-button"
      data-variant={variant}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
