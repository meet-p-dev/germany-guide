import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * OAuth / magic-link callback. Exchanges the PKCE `code` for a session and
 * writes the auth cookies DIRECTLY onto the redirect response we return.
 *
 * Why not the shared server client + next/headers cookies(): cookies set via
 * cookies() are not reliably attached to a hand-built NextResponse.redirect(),
 * so the freshly minted session was getting dropped on the redirect and the
 * server never saw a logged-in user afterwards. Binding setAll to THIS response
 * makes the session persist.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth`);
  }

  return response;
}
