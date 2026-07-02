/**
 * Germany Guide signpost mark — the exact art from assets/signpost-icon.svg
 * (dark rounded tile, cream pole, gold arrow right, red arrow left).
 * Size via the `size` prop; used in the header and anywhere the brand mark
 * is needed.
 */
export function LogoMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Germany Guide"
    >
      <rect width="64" height="64" rx="14.4" fill="#1A1A1A" />
      <rect x="30.25" y="9.5" width="3.5" height="45" rx="1.75" fill="#F6F4EF" />
      <path d="M14 15 H42 L50 22 L42 29 H14 Z" fill="#FFCE00" />
      <path d="M50 33 H22 L14 40 L22 47 H50 Z" fill="#DD0000" />
    </svg>
  );
}

/** Mark + wordmark lockup for the site header. */
export function LogoLockup() {
  return (
    <span className="flex items-center gap-2">
      <LogoMark size={28} />
      <span className="text-[17px] font-bold tracking-tight">
        Germany <span className="font-medium text-muted-foreground">Guide</span>
      </span>
    </span>
  );
}
