import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden
      className={cn("h-8 w-8 shrink-0", className)}
    >
      <rect width="64" height="64" rx="14.4" fill="#1A1A1A" />
      <rect x="30.25" y="9.5" width="3.5" height="45" rx="1.75" fill="#F6F4EF" />
      <path d="M14 15 H42 L50 22 L42 29 H14 Z" fill="#FFCE00" />
      <path d="M50 33 H22 L14 40 L22 47 H50 Z" fill="#DD0000" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
      aria-label="Germany Guide — home"
    >
      <LogoMark />
      <span className="text-[17px] tracking-tight">
        <span className="font-bold">Germany</span>{" "}
        <span className="font-medium text-muted">Guide</span>
      </span>
    </Link>
  );
}
