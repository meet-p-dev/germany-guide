"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Mail, MailCheck, UserRound } from "lucide-react";
import { z } from "zod";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { Kicker } from "@/components/ui/kicker";
import { PasswordField, passwordMeetsRules } from "@/components/auth/password-field";
import { ProviderButtons } from "@/components/auth/provider-buttons";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup" | "forgot";
type Sent = null | "verify-email" | "reset-link";

const emailSchema = z.string().trim().email();

/** Map Supabase auth errors to copy a stressed newcomer actually understands. */
function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "That email and password don't match. Try again, or reset your password below.";
  }
  if (lower.includes("email not confirmed")) {
    return "Your email is not confirmed yet. Check your inbox for our confirmation link first.";
  }
  if (lower.includes("already registered")) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  return message;
}

export function SignInForm() {
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const next = rawNext?.startsWith("/") ? rawNext : "/journey";

  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "signup" ? "signup" : "signin",
  );
  const [sent, setSent] = useState<Sent>(null);
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    searchParams.get("error")
      ? "That link did not work; it may have expired. Sign in below or request a new one."
      : "",
  );

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setError("");
    setPassword("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setError("That doesn't look like an email address.");
      return;
    }
    const supabase = getBrowserClient();

    if (mode === "forgot") {
      setBusy(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        parsedEmail.data,
        {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
        },
      );
      setBusy(false);
      if (resetError) {
        setError(friendlyAuthError(resetError.message));
      } else {
        setSent("reset-link");
      }
      return;
    }

    if (mode === "signup") {
      if (fullName.trim().length < 2) {
        setError("Please tell us your name. It personalises your journey.");
        return;
      }
      if (!passwordMeetsRules(password)) {
        setError("Your password doesn't meet the requirements below yet.");
        return;
      }
      setBusy(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: parsedEmail.data,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          data: {
            full_name: fullName.trim(),
            country: country.trim() || null,
          },
        },
      });
      setBusy(false);
      if (signUpError) {
        setError(friendlyAuthError(signUpError.message));
        return;
      }
      // Supabase returns an obfuscated user with no identities when the
      // email is already registered — don't pretend a new account was made.
      if (data.user && data.user.identities?.length === 0) {
        setError("An account with this email already exists. Sign in instead.");
        setMode("signin");
        return;
      }
      if (data.session) {
        window.location.assign(next);
      } else {
        setSent("verify-email");
      }
      return;
    }

    // mode === "signin"
    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsedEmail.data,
      password,
    });
    setBusy(false);
    if (signInError) {
      setError(friendlyAuthError(signInError.message));
    } else {
      window.location.assign(next);
    }
  };

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-success/40 bg-success-soft p-8 text-center"
      >
        <MailCheck className="mx-auto h-10 w-10 text-success" />
        <h1 className="font-display mt-4 text-2xl font-bold">
          Check your inbox
        </h1>
        <p className="mt-2 leading-relaxed text-muted">
          {sent === "verify-email" ? (
            <>
              We sent a confirmation link to{" "}
              <span className="font-semibold text-foreground">{email}</span>.
              Click it to activate your account. Your journey then syncs on
              every device.
            </>
          ) : (
            <>
              We sent a password-reset link to{" "}
              <span className="font-semibold text-foreground">{email}</span>.
              Follow it to choose a new password.
            </>
          )}
        </p>
        <p className="mt-4 text-xs text-muted">
          Nothing arriving? Check your spam folder, or{" "}
          <button
            type="button"
            onClick={() => setSent(null)}
            className="font-medium text-primary hover:underline"
          >
            try again
          </button>
          .
        </p>
      </motion.div>
    );
  }

  if (mode === "forgot") {
    return (
      <div>
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className="flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </button>
        <Kicker className="mt-6">Reset password</Kicker>
        <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
          Forgot your password?
        </h1>
        <p className="mt-3 leading-relaxed text-muted">
          Enter your email and we&apos;ll send you a link to choose a new one.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <EmailInput value={email} onChange={setEmail} />
          {error && (
            <p role="alert" className="text-sm font-medium text-primary">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? "Sending…" : "Email me a reset link"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <Kicker>{mode === "signin" ? "Welcome back" : "Create account"}</Kicker>
      <h1 className="font-display mt-3 text-3xl font-bold sm:text-4xl">
        {mode === "signin"
          ? "Take your journey everywhere."
          : "One account for your whole move."}
      </h1>
      <p className="mt-3 leading-relaxed text-muted">
        Your steps, deadlines and records, private to you and synced across
        your phone and laptop. Free, no card, no spam.
      </p>

      {/* Segmented sign in / create account switch */}
      <div
        role="tablist"
        aria-label="Sign in or create account"
        className="mt-8 flex rounded-full border border-border bg-card-muted p-1"
      >
        {(
          [
            ["signin", "Sign in"],
            ["signup", "Create account"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => switchMode(value)}
            className={cn(
              "h-10 flex-1 rounded-full text-sm font-medium transition-all",
              mode === value
                ? "bg-card font-semibold shadow-sm"
                : "text-muted hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <ProviderButtons next={next} />
      </div>

      <div className="mt-6 flex items-center gap-4" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          or with email
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {mode === "signup" && (
          <>
            <label className="block">
              <span className="text-sm font-medium">Full name</span>
              <div className="relative mt-2">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your name"
                  className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-primary"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium">
                Where are you moving from?{" "}
                <span className="font-normal text-muted">(optional)</span>
              </span>
              <div className="relative mt-2">
                <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  autoComplete="country-name"
                  value={country}
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder="e.g. India, Brazil, Türkiye"
                  className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-primary"
                />
              </div>
            </label>
          </>
        )}

        <EmailInput value={email} onChange={setEmail} />

        <PasswordField
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          showChecklist={mode === "signup"}
        />

        {mode === "signin" && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => switchMode("forgot")}
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm font-medium text-primary">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy
            ? mode === "signup"
              ? "Creating your account…"
              : "Signing in…"
            : mode === "signup"
              ? "Create my free account"
              : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        {mode === "signup" ? (
          <>
            By creating an account you agree this is general information, not
            legal advice. Your local progress on this device is kept and merged,
            so nothing is lost.
          </>
        ) : (
          <>
            New here?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className="font-medium text-primary hover:underline"
            >
              Create a free account
            </button>. Your local progress on this device is kept and merged.
          </>
        )}
      </p>
    </div>
  );
}

function EmailInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">Email address</span>
      <div className="relative mt-2">
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="email"
          autoComplete="email"
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="you@example.com"
          className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-[15px] outline-none transition-colors focus:border-primary"
        />
      </div>
    </label>
  );
}
