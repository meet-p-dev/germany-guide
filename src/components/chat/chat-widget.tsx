"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Globe,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ChatEntry {
  role: "user" | "assistant";
  content: string;
  source?: "site" | "web";
  links?: { title: string; url: string }[];
}

const STARTERS = [
  "How does Anmeldung work?",
  "What will my visa cost?",
  "How much goes in the blocked account?",
];

/**
 * Sitewide assistant: answers from the guide's own pages first (linked), and
 * clearly labels anything that came from the open web instead.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  /** History of a request that failed because the network was down, kept so it
   *  can be re-sent — automatically when the connection returns, or on demand. */
  const [retry, setRetry] = useState<ChatEntry[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const retryRef = useRef<ChatEntry[] | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries, loading, open, retry]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  /** Runs one exchange against the API for an already-built history (its last
   *  entry is the user's question). Separate from `send` so a retry re-runs the
   *  same history without appending a duplicate user bubble. */
  const run = useCallback(async (history: ChatEntry[]) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setRetry(null);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (res.status === 503) {
        setEntries((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "The assistant is not switched on yet. Everything is still browsable via The process, Problems and Letters.",
          },
        ]);
        return;
      }
      const data = (await res.json()) as {
        answer?: string;
        source?: "site" | "web";
        links?: { title: string; url: string }[];
        error?: string;
      };
      setEntries((prev) => [
        ...prev,
        data.answer
          ? {
              role: "assistant",
              content: data.answer,
              source: data.source,
              links: data.links,
            }
          : {
              role: "assistant",
              content: data.error ?? "Something went wrong. Try again.",
            },
      ]);
    } catch {
      // Network failure (offline / dropped connection). Don't spend a transcript
      // bubble on it — remember the question and offer/trigger a retry instead.
      setRetry(history);
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, []);

  // Mirror `retry` into a ref so the once-registered online listener always sees
  // the latest pending request without re-subscribing on every change.
  useEffect(() => {
    retryRef.current = retry;
  }, [retry]);

  // Connection came back: automatically re-send the question that failed offline.
  useEffect(() => {
    const onOnline = () => {
      if (retryRef.current) void run(retryRef.current);
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [run]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || busyRef.current) return;
    setInput("");
    const history = [...entries, { role: "user" as const, content: text }];
    setEntries(history);
    void run(history);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close the guide assistant" : "Open the guide assistant"}
        aria-expanded={open}
        className={cn(
          "fixed bottom-5 right-5 z-50 flex h-13 w-13 items-center justify-center rounded-full shadow-lg transition-all",
          "bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-xl",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Guide assistant"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={cn(
              "fixed bottom-21 right-5 z-50 flex max-h-[min(34rem,calc(100dvh-7rem))] w-[min(24rem,calc(100vw-2.5rem))] flex-col",
              "overflow-hidden rounded-3xl border border-border bg-card shadow-2xl",
            )}
          >
            <div className="border-b border-border bg-card-muted/60 px-5 py-4">
              <p className="font-display font-bold">Guide assistant</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">
                Answers from this guide, with links. Web finds are labeled, and you should always
                verify those at the source.
              </p>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {entries.length === 0 && (
                <div>
                  <p className="text-sm text-muted">Try one of these:</p>
                  <div className="mt-2.5 flex flex-col items-start gap-2">
                    {STARTERS.map((starter) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => void send(starter)}
                        className="rounded-2xl border border-border bg-background px-3.5 py-2 text-left text-sm font-medium transition-colors hover:border-foreground/25"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {entries.map((entry, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[88%]",
                    entry.role === "user" ? "ml-auto" : "mr-auto",
                  )}
                >
                  {entry.role === "assistant" && entry.source === "web" && (
                    <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-semibold text-gold">
                      <Globe className="h-3 w-3" />
                      Found on the web. Verify at the source
                    </p>
                  )}
                  {entry.role === "assistant" && entry.source === "site" && (
                    <p className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
                      <ShieldCheck className="h-3 w-3" />
                      From this guide
                    </p>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      entry.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card-muted/70",
                    )}
                  >
                    {entry.role === "user" ? (
                      entry.content
                    ) : (
                      <Markdown className="prose-sm">{entry.content}</Markdown>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <p className="flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Looking it up…
                </p>
              )}

              {retry && !loading && (
                <div className="mr-auto max-w-[88%] rounded-2xl border border-border bg-card-muted/70 px-4 py-3 text-sm">
                  <p className="text-muted">
                    You look offline. I will re-send your question
                    automatically the moment your connection is back.
                  </p>
                  <button
                    type="button"
                    onClick={() => void run(retry)}
                    className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry now
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void send();
                  }}
                  placeholder="Ask about moving to Germany…"
                  aria-label="Your question"
                  className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={loading || input.trim().length === 0}
                  aria-label="Send"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 px-1 text-[11px] leading-relaxed text-muted">
                AI-generated. General information, not legal advice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
