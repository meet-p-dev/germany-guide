export const DISCLAIMER_TEXT =
  "This is general information, not legal advice. Rules and procedures change — always verify with the linked official source before acting.";

export function Disclaimer() {
  return (
    <p className="rounded-xl border border-gg-amber-ui/30 bg-gg-amber-soft px-4 py-3 text-sm text-gg-amber">
      {DISCLAIMER_TEXT}
    </p>
  );
}

export function FreshnessNote({
  lastVerifiedAt,
  sources,
}: {
  lastVerifiedAt: string | null;
  sources: unknown;
}) {
  const sourceList = Array.isArray(sources)
    ? (sources as { url?: string; title?: string }[]).filter((s) => s.url)
    : [];
  if (!lastVerifiedAt && sourceList.length === 0) return null;
  return (
    <div className="text-xs text-muted-foreground">
      {lastVerifiedAt && <span>Last verified: {lastVerifiedAt}</span>}
      {sourceList.length > 0 && (
        <>
          {lastVerifiedAt && <span> · </span>}
          <span>
            Official source{sourceList.length > 1 ? "s" : ""}:{" "}
            {sourceList.map((s, i) => (
              <span key={s.url}>
                {i > 0 && ", "}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener nofollow"
                  className="underline"
                >
                  {s.title ?? s.url}
                </a>
              </span>
            ))}
          </span>
        </>
      )}
    </div>
  );
}
