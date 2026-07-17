/** Thin German tricolor stripe pinned to the very top of every page. */
export function FlagStripe() {
  return (
    <div aria-hidden className="flex h-1 w-full">
      <div className="flex-1 bg-flag-black" />
      <div className="flex-1 bg-flag-red" />
      <div className="flex-1 bg-flag-gold" />
    </div>
  );
}
