export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6" aria-busy>
      <div className="h-3 w-28 animate-pulse rounded-full bg-card-muted" />
      <div className="mt-5 h-10 w-3/4 animate-pulse rounded-2xl bg-card-muted" />
      <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-card-muted" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded-full bg-card-muted" />
      <div className="mt-10 space-y-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-3xl bg-card-muted"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
