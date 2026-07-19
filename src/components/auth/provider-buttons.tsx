"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { cn } from "@/lib/utils";

// Apple sign-in is temporarily disabled until the Apple Developer account is
// active. To re-enable: add "apple" back to Provider, restore the AppleMark
// and its button below, and enable Apple in Supabase Auth → Providers.
type Provider = "google";

/** Official brand mark — auth buttons are the one place brand SVGs belong. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.8.14-1.57.38-2.29V6.62H1.29a11.99 11.99 0 0 0 0 10.76l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

/**
 * "Continue with Google" button. OAuth restarts the page, so the only error
 * surface we need is the pre-redirect failure (e.g. provider disabled).
 */
export function ProviderButtons({ next }: { next: string }) {
  const [pending, setPending] = useState<Provider | null>(null);
  const [error, setError] = useState("");

  const continueWith = async (provider: Provider) => {
    setPending(provider);
    setError("");
    const { error: oauthError } = await getBrowserClient().auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (oauthError) {
      setPending(null);
      setError(
        "Couldn't start Google sign-in. Please try again or use your email instead.",
      );
    }
  };

  const buttonClass = cn(
    "flex h-12 w-full items-center justify-center gap-3 rounded-full border border-border bg-card text-[15px] font-medium transition-all",
    "hover:border-foreground/30 hover:shadow-sm active:scale-[0.98]",
    "disabled:pointer-events-none disabled:opacity-60",
  );

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void continueWith("google")}
        disabled={pending !== null}
        className={buttonClass}
      >
        <GoogleMark />
        {pending === "google" ? "Opening Google…" : "Continue with Google"}
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
