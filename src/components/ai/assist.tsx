"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  ImagePlus,
  Loader2,
  MailQuestion,
  MessageCircleQuestion,
  Send,
  X,
} from "lucide-react";
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
    imageDataUrl?: string;
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
          message: data.error ?? "Something went wrong. Try again.",
        });
        return;
      }
      setState({ status: "answer", answer: data.answer });
    } catch {
      setState({ status: "error", message: "Network problem. Try again." });
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
          The AI helper is not switched on yet. Everything else on this
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

/**
 * Photos come in at phone-camera resolution; the model needs far less. Downscale
 * on-device so the upload stays small and nothing bigger than needed leaves
 * the browser. Re-encoding to JPEG also normalises whatever format came in.
 */
async function imageFileToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const MAX_EDGE = 1600;
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

/** Paste, photograph or drop any official German letter → what it is, urgency, what to do. */
export function LetterDecoder() {
  const { state, ask } = useAssist();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  // Two inputs, not one: the camera input carries `capture` so phones open
  // the camera straight away; the gallery input omits it so the same phones
  // open the photo library / file picker instead.
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const acceptFile = async (file: File | undefined) => {
    if (!file) return;
    setImageError(null);
    if (!file.type.startsWith("image/")) {
      setImageError("That file is not an image. Drop a photo of the letter.");
      return;
    }
    try {
      setImage(await imageFileToDataUrl(file));
    } catch {
      setImageError(
        "Could not read that image. Try a JPG or PNG photo instead.",
      );
    }
  };

  const canDecode =
    state.status !== "loading" && (image !== null || text.trim().length >= 40);

  return (
    <section
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void acceptFile(event.dataTransfer.files[0]);
      }}
      className={cn(
        "mt-10 rounded-3xl border bg-gold-soft/40 p-6 transition-colors",
        dragging ? "border-primary" : "border-gold/40",
      )}
    >
      <p className="flex items-center gap-2 font-display text-xl font-bold">
        <MailQuestion className="h-5 w-5 text-gold" />
        Decode your letter now
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Snap a photo of the letter, drop an image here, or paste its text
        (German is fine), and get a plain answer: what it is, how urgent,
        what to do.
      </p>

      {image ? (
        <div className="mt-4 flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- transient local data URL, not an asset */}
          <img
            src={image}
            alt="Your letter, ready to decode"
            className="h-28 w-auto max-w-[10rem] rounded-xl border border-border object-cover"
          />
          <button
            type="button"
            onClick={() => setImage(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Remove photo
          </button>
        </div>
      ) : (
        <textarea
          rows={5}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Sehr geehrte(r) …"
          className="mt-4 w-full resize-y rounded-2xl border border-border bg-background p-4 text-[15px] outline-none focus:border-primary"
        />
      )}

      {imageError && (
        <p className="mt-2 text-sm text-primary">{imageError}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(event) => {
              void acceptFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              void acceptFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => cameraInputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {image ? "Retake" : "Scan"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => galleryInputRef.current?.click()}
          >
            <ImagePlus className="h-4 w-4" />
            {image ? "Replace photo" : "Add photo"}
          </Button>
        </div>
        <Button
          size="sm"
          disabled={!canDecode}
          onClick={() =>
            void ask({
              mode: "letter",
              text: image ? text.trim() : text,
              ...(image ? { imageDataUrl: image } : {}),
            })
          }
        >
          <Send className="h-4 w-4" />
          Decode
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted">
        Cover or leave out personal data you would rather not share. It
        isn&apos;t needed for the answer. Photos are analysed once and not
        stored.
      </p>
      <AnswerPanel state={state} />
      <p className="mt-4 text-xs text-muted">
        AI-generated from your letter. General information, not legal advice.
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
        Answers come only from this guide page. For anything beyond it, we will
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
        AI-generated. General information, not legal advice.
      </p>
    </section>
  );
}
