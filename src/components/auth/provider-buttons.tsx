"use client";

import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { cn } from "@/lib/utils";

type Provider = "google" | "apple";

/** Official brand marks — auth buttons are the one place brand SVGs belong. */
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

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.24 3.09-.9 1.01-2.1 1.6-3.21 1.51-.06-1.1.44-2.22 1.24-3.06.87-.94 2.2-1.56 3.21-1.54zM20.94 17.1c-.53 1.22-.78 1.76-1.46 2.84-.95 1.51-2.29 3.39-3.95 3.4-1.47.02-1.86-.96-3.85-.95-2 .01-2.42.97-3.9.96-1.66-.02-2.93-1.71-3.88-3.22C1.24 16.02.96 11.3 2.7 8.8c1.23-1.78 3.17-2.83 5-2.83 1.86 0 3.03 1.02 4.57 1.02 1.49 0 2.4-1.02 4.55-1.02 1.62 0 3.34.88 4.56 2.41-4.01 2.2-3.36 7.93-.44 8.72z" />
    </svg>
  );
}

/**
 * "Continue with Google / Apple" pair. OAuth restarts the page, so the only
 * error surface we need is the pre-redirect failure (e.g. provider disabled).
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
        `Couldn't start ${provider === "google" ? "Google" : "Apple"} sign-in. Please try again or use your email instead.`,
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
      <button
        type="button"
        onClick={() => void continueWith("apple")}
        disabled={pending !== null}
        className={buttonClass}
      >
        <AppleMark />
        {pending === "apple" ? "Opening Apple…" : "Continue with Apple"}
      </button>
      {error && (
        <p role="alert" className="text-sm font-medium text-primary">
          {error}
        </p>
      )}
    </div>
  );
}
