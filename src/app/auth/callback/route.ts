import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/server-client";

/** Email-link OTP types we accept (recovery, signup confirmation, magic link). */
type EmailOtpType =
  | "recovery"
  | "email"
  | "signup"
  | "magiclink"
  | "email_change"
  | "invite";

/**
 * Completes every auth redirect and lands the fresh session where it belongs.
 *
 * - Email links (password recovery, signup confirmation) arrive with a
 *   one-time `token_hash` + `type` — verified with verifyOtp. This is the
 *   robust path: it needs no PKCE verifier, so it works cross-device.
 * - OAuth (Google) arrives with a PKCE `code` — exchanged for a session.
 *
 * `next` decides the destination (recovery passes /reset-password); we only
 * ever redirect to same-site relative paths.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next") ?? "/journey";
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/journey";

  const supabase = await createAuthServerClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=link`);
}
