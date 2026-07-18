"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, MailQuestion, MessageCircleQuestion, Send } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

type AssistState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "answer"; answer: string }
  | { status: "error"; message: string }
  | { status: "unavailable" };

function useAssist() {
  const [state, setState] = useState<AssistState>({ status: "idle" });

  const ask = async (payload: {
    mode: "letter" | "step";
    text: string;
    stepSlug?: string;
  }) => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 503) {
        setState({ status: "unavailable" });
        return;
      }
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok || !data.answer) {
        setState({
          status: "error",
          message: data.error ?? "Something went wrong — try again.",
        });
        return;
      }
      setState({ status: "answer", answer: data.answer });
    } catch {
      setState({ status: "error", message: "Network hiccup — try again." });
    }
  };

  return { state, ask };
}

function AnswerPanel({ state }: { state: AssistState }) {
  if (state.status === "idle") return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="mt-4"
    >
      {state.status === "loading" && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Reading…
        </p>
      )}
      {state.status === "error" && (
        <p className="rounded-2xl bg-primary-soft p-4 text-sm text-primary">
          {state.message}
        </p>
      )}
      {state.status === "unavailable" && (
        <p className="rounded-2xl bg-card-muted/70 p-4 text-sm text-muted">
          The AI helper isn&apos;t switched on yet — everything else on this
          page works without it.
        </p>
      )}
      {state.status === "answer" && (
        <div className="rounded-2xl border border-border bg-card-muted/40 p-5">
          <Markdown className="prose-sm">{state.answer}</Markdown>
        </div>
      )}
    </motion.div>
  );
}

/** Paste any official German letter → what it is, urgency, what to do. */
export function LetterDecoder() {
  const { state, ask } = useAssist();
  const [text, setText] = useState("");

  return (
    <section className="mt-10 rounded-3xl border border-gold/40 bg-gold-soft/40 p-6">
      <p className="flex items-center gap-2 font-display text-xl font-bold">
        <MailQuestion className="h-5 w-5 text-gold" />
        Decode your letter now
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Type or paste the letter&apos;s text (German is fine) and get a plain
        answer: what it is, how urgent, what to do.
      </p>
      <textarea
        rows={5}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Sehr geehrte(r) …"
        className="mt-4 w-full resize-y rounded-2xl border border-border bg-background p-4 text-[15px] outline-none focus:border-primary"
      />
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Leave out personal data you&apos;d rather not share — it isn&apos;t
          needed for the answer.
        </p>
        <Button
          size="sm"
          disabled={state.status === "loading" || text.trim().length < 40}
          onClick={() => void ask({ mode: "letter", text })}
        >
          <Send className="h-4 w-4" />
          Decode
        </Button>
      </div>
      <AnswerPanel state={state} />
      <p className="mt-4 text-xs text-muted">
        AI-generated from your text — general information, not legal advice.
      </p>
    </section>
  );
}

/** Ask a question about this one step — answered only from the guide itself. */
export function StepAsk({ stepSlug }: { stepSlug: string }) {
  const { state, ask } = useAssist();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "mt-12 flex w-full items-center gap-3 rounded-3xl border border-dashed border-border bg-card-muted/40 p-5 text-left",
          "transition-all hover:border-foreground/25 hover:bg-card-muted/70",
        )}
      >
        <MessageCircleQuestion className="h-5 w-5 shrink-0 text-primary" />
        <span className="text-[15px] font-medium">
          Still unsure about something on this step? Ask.
        </span>
      </button>
    );
  }

  return (
    <section className="mt-12 rounded-3xl border border-border bg-card p-6">
      <p className="flex items-center gap-2 font-display text-lg font-bold">
        <MessageCircleQuestion className="h-5 w-5 text-primary" />
        Ask about this step
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Answers come only from this guide page — anything beyond it, we&apos;ll
        point you to the official source instead of guessing.
      </p>
      <div className="mt-4 flex items-start gap-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && text.trim().length >= 8) {
              void ask({ mode: "step", text, stepSlug });
            }
          }}
          placeholder="e.g. Can I do this before my visa arrives?"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-[15px] outline-none focus:border-primary"
        />
        <Button
          disabled={state.status === "loading" || text.trim().length < 8}
          onClick={() => void ask({ mode: "step", text, stepSlug })}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <AnswerPanel state={state} />
      <p className="mt-4 text-xs text-muted">
        AI-generated — general information, not legal advice.
      </p>
    </section>
  );
}
