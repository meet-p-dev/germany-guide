"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight">
            Sign in to save your progress
          </h1>
          <p className="text-sm text-muted-foreground">
            Optional — everything is free to browse. Signing in only syncs your
            roadmap and checklist progress across devices.
          </p>
        </div>

        <div className="mt-7 space-y-4">
          {status === "sent" ? (
            <p className="rounded-2xl border border-primary/30 bg-primary/[0.06] p-4 text-center text-sm">
              Check your inbox — we sent a sign-in link to{" "}
              <strong>{email}</strong>.
            </p>
          ) : (
            <form onSubmit={signInWithEmail} className="space-y-3">
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-full"
              />
              <Button
                type="submit"
                className="w-full rounded-full font-semibold"
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending…" : "Send sign-in link"}
              </Button>
            </form>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button
            variant="outline"
            className="w-full rounded-full font-semibold"
            onClick={signInWithGoogle}
          >
            Continue with Google
          </Button>

          {status === "error" && (
            <p className="text-center text-sm text-destructive">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
