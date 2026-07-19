import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase/server-client";

/**
 * PKCE code exchange for every email link (confirmation, recovery, OAuth
 * redirect). `next` decides where the fresh session lands — recovery links
 * pass /reset-password, everything else defaults to the journey.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/journey";
  // Only same-site relative paths — never redirect to another origin.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//")
    ? rawNext
    : "/journey";

  if (code) {
    const supabase = await createAuthServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=link`);
}
