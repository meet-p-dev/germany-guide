"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Check, Globe, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { useVisitorProfile } from "@/lib/profile-store";
import { Button } from "@/components/ui/button";
import { PasswordField, passwordMeetsRules } from "@/components/auth/password-field";

const PROVIDER_LABELS: Record<string, string> = {
  email: "Email & password",
  google: "Google",
  apple: "Apple",
};

/** Turn GoTrue password-update errors into copy a user can act on. */
function friendlyPasswordError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("different from the old")) {
    return "That's already your current password — pick a new one.";
  }
  if (
    lower.includes("current password") ||
    lower.includes("reauthentication") ||
    lower.includes("incorrect")
  ) {
    return "To change your password, enter your current one above. If you only ever signed in with Google, use “Forgot password?” on the sign-in page to set your first password.";
  }
  if (lower.includes("weak") || lower.includes("pwned") || lower.includes("leaked")) {
    return "That password has appeared in a data breach — please choose a different one.";
  }
  return message;
}

/** Editable identity details + password management for the signed-in user. */
export function ProfileSettings({ session }: { session: Session }) {
  const { signOut } = useVisitorProfile();
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("");
  const [identityStatus, setIdentityStatus] = useState<
    "loading" | "idle" | "saving" | "saved" | "error"
  >("loading");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [passwordError, setPasswordError] = useState("");

  const providers: string[] = session.user.app_metadata.providers ?? [
    session.user.app_metadata.provider ?? "email",
  ];
  const hasPassword = providers.includes("email");

  useEffect(() => {
    let cancelled = false;
    getBrowserClient()
      .from("profiles")
      .select("full_name, country")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const metaName =
          (session.user.user_metadata.full_name as string | undefined) ??
          (session.user.user_metadata.name as string | undefined);
        setFullName(data?.full_name ?? metaName ?? "");
        setCountry(data?.country ?? "");
        setIdentityStatus("idle");
      });
    return () => {
      cancelled = true;
    };
  }, [session.user.id, session.user.user_metadata]);

  const saveIdentity = async (event: React.FormEvent) => {
    event.preventDefault();
    setIdentityStatus("saving");
    const supabase = getBrowserClient();
    const name = fullName.trim() || null;
    const from = country.trim() || null;
    const [profileRes, userRes] = await Promise.all([
      supabase
        .from("profiles")
        .upsert({ id: session.user.id, full_name: name, country: from }),
      // Keep auth metadata in sync so the header greets by name immediately.
      supabase.auth.updateUser({ data: { full_name: name, country: from } }),
    ]);
    if (profileRes.error || userRes.error) {
      console.error(
        "Saving profile failed:",
        profileRes.error ?? userRes.error,
      );
      setIdentityStatus("error");
    } else {
      setIdentityStatus("saved");
      setTimeout(() => setIdentityStatus("idle"), 2500);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    if (!passwordMeetsRules(newPassword)) {
      setPasswordError("Your new password doesn't meet the requirements yet.");
      return;
    }
    setPasswordStatus("saving");
    // Pass current_password when supplied so the change succeeds even if the
    // project enforces "require current password" — left blank for people
    // who only ever signed in with Google and have no password yet.
    const { error } = await getBrowserClient().auth.updateUser({
      password: newPassword,
      ...(currentPassword ? { current_password: currentPassword } : {}),
    });
    if (error) {
      setPasswordStatus("idle");
      setPasswordError(friendlyPasswordError(error.message));
    } else {
      setPasswordStatus("saved");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordStatus("idle"), 2500);
    }
  };

  return (
    <>
      {/* Who you are */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="flex items-center gap-2 font-display text-lg font-bold">
          <UserRound className="h-5 w-5 text-primary" />
          Your details
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          How we greet you, and where you&apos;re starting your move from.
        </p>
        <form onSubmit={saveIdentity} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium">Full name</span>
              <input
                type="text"
                autoComplete="name"
                value={fullName}
                disabled={identityStatus === "loading"}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your name"
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-4 text-[15px] outline-none transition-colors focus:border-primary disabled:opacity-60"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Moving from</span>
              <div className="relative mt-2">
                <Globe className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  autoComplete="country-name"
                  value={country}
                  disabled={identityStatus === "loading"}
                  onChange={(event) => setCountry(event.target.value)}
                  placeholder="Your home country"
                  className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-[15px] outline-none transition-colors focus:border-primary disabled:opacity-60"
                />
              </div>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={identityStatus === "loading" || identityStatus === "saving"}
            >
              {identityStatus === "saving" ? "Saving…" : "Save details"}
            </Button>
            {identityStatus === "saved" && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                <Check className="h-4 w-4" />
                Saved
              </span>
            )}
            {identityStatus === "error" && (
              <span role="alert" className="text-sm font-medium text-primary">
                Saving failed — try again.
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Sign-in & security */}
      <section className="mt-6 rounded-3xl border border-border bg-card p-6">
        <p className="flex items-center gap-2 font-display text-lg font-bold">
          <ShieldCheck className="h-5 w-5 text-success" />
          Sign-in &amp; security
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          You sign in with{" "}
          <span className="font-medium text-foreground">
            {providers
              .map((p) => PROVIDER_LABELS[p] ?? p)
              .join(" and ")}
          </span>{" "}
          as{" "}
          <span className="font-medium text-foreground">
            {session.user.email}
          </span>
          .
        </p>
        <form onSubmit={savePassword} className="mt-4 max-w-sm space-y-4">
          {hasPassword && (
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              required={false}
            />
          )}
          <PasswordField
            label={hasPassword ? "New password" : "Set a password"}
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            showChecklist={newPassword.length > 0}
          />
          {passwordError && (
            <p role="alert" className="text-sm font-medium text-primary">
              {passwordError}
            </p>
          )}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={passwordStatus === "saving" || newPassword.length === 0}
            >
              {passwordStatus === "saving"
                ? "Updating…"
                : hasPassword
                  ? "Update password"
                  : "Set password"}
            </Button>
            {passwordStatus === "saved" && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-success">
                <Check className="h-4 w-4" />
                Password updated
              </span>
            )}
          </div>
        </form>
        <div className="mt-6 border-t border-border pt-4">
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out on this device
          </button>
        </div>
      </section>
    </>
  );
}
