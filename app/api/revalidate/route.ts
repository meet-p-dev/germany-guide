import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand revalidation for external tools (generation scripts, cron):
 *   curl -X POST "$SITE/api/revalidate?secret=$REVALIDATE_SECRET"
 * The in-app publish action calls revalidatePath directly and doesn't need this.
 */
export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secret || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true });
}
