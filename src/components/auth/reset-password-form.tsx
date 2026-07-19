"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, KeyRound } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { Button, ButtonLink } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { PasswordField, passwordMeetsRules } from "@/components/auth/password-field";

/**
 * Lands here from the password-recovery email (the callback route has already
 * exchanged the code, so the visitor arrives with a session).
 */
export function ResetPasswordForm() {
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getBrowserClient()
      .auth.getSession()
      .then(({ data }) => setHasSession(Boolean(data.session)));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!passwordMeetsRules(password)) {
      setError("Your new password doesn't meet the requirements below yet.");
      return;
    }
    setBusy(true);
    const { error: updateError } = await getBrowserClient().auth.updateUser({
      password,
    });
    setBusy(false);
    if (updateError) {
      setError(
        updateError.message.toLowerCase().includes("different from the old")
          ? "That's already your current password — pick a new one."
          : updateError.message,
      );
    } else {
      setDone(true);
    }
  };

  if (hasSession === null) {
    return (
      <div aria-hidden className="animate-pulse">
        <div className="h-5 w-32 rounded-full bg-card-muted" />
        <div className="mt-4 h-10 w-2/3 rounded-2xl bg-card-muted" />
        <div className="mt-8 h-40 rounded-3xl bg-card-muted" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div>
        <Kicker>Reset password</Kicker>
        <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
          This link has expired.
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          Password-reset links only work once and only for a short while.
          Request a fresh one and try again.
        </p>
        <ButtonLink href="/signin" size="lg" className="mt-8">
          Back to sign in
        </ButtonLink>
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-success/40 bg-success-soft p-8 text-center"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
        <h1 className="font-display mt-4 text-2xl font-bold">
          Password updated
        </h1>
        <p className="mt-2 leading-relaxed text-muted">
          You&apos;re signed in and your new password is active on all devices.
        </p>
        <ButtonLink href="/journey" size="lg" className="mt-6">
          Continue to my journey
        </ButtonLink>
      </motion.div>
    );
  }

  return (
    <div>
      <Kicker>Reset password</Kicker>
      <h1 className="font-display mt-3 flex items-center gap-3 text-3xl font-bold sm:text-4xl">
        <KeyRound className="h-7 w-7 text-primary" />
        Choose a new password.
      </h1>
      <p className="mt-3 leading-relaxed text-muted">
        Pick something strong — this protects your deadlines, notes and
        reference numbers.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <PasswordField
          label="New password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          showChecklist
        />
        {error && (
          <p role="alert" className="text-sm font-medium text-primary">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Saving…" : "Save new password"}
        </Button>
      </form>
    </div>
  );
}
