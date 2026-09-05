import { NextResponse } from "next/server";
import { runDigest } from "@/lib/email/digest";

/**
 * Monthly digest, fired by the Vercel cron declared in `vercel.json`.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET`. Without that secret set,
 * the route refuses to run at all rather than defaulting to open — this
 * endpoint mails every confirmed subscriber, so an unauthenticated caller
 * could otherwise empty the monthly quota and spam the list.
 */

// Sending mail is never a cached GET.
export const dynamic = "force-dynamic";
// The loop is sequential and paced by the provider; give it room.
export const maxDuration = 300;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDigest();
  const ok = result.status === "sent" || result.status === "skipped";
  return NextResponse.json(result, { status: ok ? 200 : 500 });
}
