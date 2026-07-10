import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next 16 Proxy (formerly middleware). Refreshes the Supabase auth session on
 * EVERY page request and writes the rotated cookies back onto the response, so
 * the session stays valid as you navigate the whole site — not just on the
 * account/admin/auth routes. Restricting this to a few paths is the classic
 * cause of "it logs me out on the home page": the token is never refreshed
 * there, so the header reads a stale session.
 */
export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth token if present (rotates cookies via setAll above).
  // Required for both server components and the client header to see a valid
  // session after the access token's short lifetime.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  // Run on every route EXCEPT static assets, image optimization, metadata
  // files, API routes and image files — so the session is kept fresh site-wide.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
