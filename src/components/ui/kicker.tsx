import { cn } from "@/lib/utils";

/** Small uppercase letter-spaced section label, e.g. "HOW IT WORKS". */
export function Kicker({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.18em] text-muted",
        className,
      )}
    >
      {children}
    </p>
  );
}
