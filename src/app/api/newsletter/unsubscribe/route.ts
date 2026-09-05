import { NextResponse } from "next/server";
import { unsubscribeByToken } from "@/lib/newsletter";

/**
 * RFC 8058 one-click unsubscribe.
 *
 * Gmail and Yahoo require bulk senders to honour the "Unsubscribe" button their
 * own UI shows. That button POSTs here (never GETs), which is why this endpoint
 * acts immediately while the human-facing `/newsletter/unsubscribe` page waits
 * for a button press — a link scanner cannot trip this one.
 *
 * It always answers 200: the mail provider only needs to know the request was
 * accepted, and a 4xx would be read as a broken unsubscribe.
 */
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const outcome = await unsubscribeByToken(token);
  return NextResponse.json({ outcome }, { status: 200 });
}
