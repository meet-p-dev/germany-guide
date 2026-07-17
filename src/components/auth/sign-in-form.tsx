"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Mail } from "lucide-react";
import { z } from "zod";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";

const emailSchema = z.string().trim().email();

export function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >(searchParams.get("error") ? "error" : "idle");
  const [errorMessage, setErrorMessage] = useState(
    searchParams.get("error")
      ? "That sign-in link didn't work — it may have expired. Request a new one."
      : "",
  );

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setStatus("error");
      setErrorMessage("That doesn't look like an email address.");
      return;
    }
    setStatus("sending");
    const supabase = getBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
    } else {
      setStatus("sent");
    }
  };

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-success/40 bg-success-soft p-8 text-center"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h1 className="font-display mt-4 text-2xl font-bold">
          Check your inbox
        </h1>
        <p className="mt-2 leading-relaxed text-muted">
          We sent a sign-in link to{" "}
          <span className="font-semibold text-foreground">{email}</span>. Click
          it on this device and your journey syncs automatically.
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      <Kicker>Sign in</Kicker>
      <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
        Take your journey everywhere.
      </h1>
      <p className="mt-3 leading-relaxed text-muted">
        No password, no forms — we email you a magic link. Your ticked steps
        and settings sync across your phone and laptop.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Email address</span>
          <div className="relative mt-2">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-primary"
            />
          </div>
        </label>

        {status === "error" && (
          <p role="alert" className="text-sm font-medium text-primary">
            {errorMessage}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending link…" : "Email me a sign-in link"}
        </Button>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        Signing in creates an account if you don&apos;t have one. Your local
        progress on this device is kept and merged — nothing is lost.
      </p>
    </div>
  );
}
