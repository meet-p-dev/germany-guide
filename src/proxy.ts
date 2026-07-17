import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

/**
 * Next 16 proxy (formerly middleware): keeps Supabase auth sessions fresh by
 * re-validating the auth cookie on matched requests.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refreshes the session if expired — required for server-side auth.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Only run where auth state can matter; static assets skip the proxy.
  matcher: ["/((?!_next/static|_next/image|images|fonts|favicon.ico|.*\\.svg$|.*\\.png$).*)"],
};
