import { NextResponse } from "next/server";
import { createContentClient } from "@/lib/supabase/content-client";

/**
 * Grounded AI helpers, powered by Groq (OpenAI-compatible API).
 *
 * Two modes:
 * - "letter": paste a German official letter → what it is, urgency, next steps,
 *   mapped to the site's /letters guides where possible.
 * - "step":   a question about one guide step, answered ONLY from that step's
 *   own content, with a pointer to the official source for anything beyond it.
 *
 * The GROQ_API_KEY lives server-side only. Without it the route degrades to
 * 503 and the client components hide themselves — the site works fine without.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Groq retires hosted models on a rolling basis (e.g. the Llama 4 vision
// models were shut down in mid-2026), so both IDs are env-overridable — a
// future deprecation can be fixed by setting the var, no code deploy needed.
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
/** Vision-capable model for photographed/scanned letters. */
const VISION_MODEL = process.env.GROQ_VISION_MODEL ?? "qwen/qwen3.6-27b";
const MAX_INPUT_CHARS = 6000;
/** Data-URL ceiling (~4.5 MB image after base64) — client downscales first. */
const MAX_IMAGE_DATA_URL_CHARS = 6_000_000;

const SHARED_RULES = `You write for stressed newcomers to Germany. Rules you never break:
- Plain English, calm tone, short sentences under 25 words. No emojis.
- NEVER use an em dash (—). Use a full stop, a colon, brackets or a comma instead. Write ranges as "3 to 6 months", not "3–6 months".
- No bold for emphasis, at most one bold phrase per answer. No scaffolding labels like "The flow:", "The catch:" or "The good news:". No idioms and no "X, not Y" flourishes.
- NEVER invent amounts, fees, deadlines, paragraphs of law, or office names that are not in the provided material. If you don't know, say "check the official source".
- You give general information, never legal advice, and you say so once at the end: "General information, not legal advice."`;

interface AssistBody {
  mode?: string;
  text?: string;
  stepSlug?: string;
  /** Letter mode only: a photo/scan of the letter as a data URL. */
  imageDataUrl?: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI helper is not configured." },
      { status: 503 },
    );
  }

  let body: AssistBody;
  try {
    body = (await request.json()) as AssistBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  const imageDataUrl = (body.imageDataUrl ?? "").trim();
  const hasImage = imageDataUrl.length > 0 && body.mode === "letter";

  if (hasImage) {
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(imageDataUrl)) {
      return NextResponse.json(
        { error: "The image must be a JPEG, PNG or WebP photo." },
        { status: 400 },
      );
    }
    if (imageDataUrl.length > MAX_IMAGE_DATA_URL_CHARS) {
      return NextResponse.json(
        { error: "That image is too large. Try a smaller photo." },
        { status: 400 },
      );
    }
  }

  if (!text && !hasImage) {
    return NextResponse.json({ error: "Nothing to analyse." }, { status: 400 });
  }
  if (text.length > MAX_INPUT_CHARS) {
    return NextResponse.json(
      { error: `Please shorten the text to under ${MAX_INPUT_CHARS} characters.` },
      { status: 400 },
    );
  }

  let system: string;
  let user: string;

  if (body.mode === "letter") {
    const supabase = createContentClient();
    const { data: letters } = await supabase
      .from("letters")
      .select("slug, name, german_name, sender, urgency");
    const known = (letters ?? [])
      .map(
        (l) =>
          `- ${l.name}${l.german_name ? ` (${l.german_name})` : ""}${l.sender ? ` from ${l.sender}` : ""} → guide page /letters/${l.slug}`,
      )
      .join("\n");

    system = `You are the letter decoder for Germany Guide (germanyguide.net). The user pastes text from an official German letter. Respond in exactly this structure, using markdown headings:

**What this is** — one or two sentences.
**How urgent** — one line: act now / respond soon / no rush, and why.
**What to do** — a short numbered list of concrete next actions.

If the letter clearly matches one of these known letter types, add one line: "Full guide: /letters/<slug>".
Known letter types:
${known}

${SHARED_RULES}
- Only use dates, amounts and reference numbers that appear in the letter itself.
- If the input does not look like an official letter, say so briefly and stop.
- If parts of a photographed letter are unreadable, say which part you could not read instead of guessing.`;
    user = hasImage
      ? text
        ? `Here is a photo of the letter. Extra context from the user:\n\n${text}`
        : "Here is a photo of the letter."
      : `Here is the letter text:\n\n${text}`;
  } else if (body.mode === "step") {
    const slug = (body.stepSlug ?? "").trim();
    if (!slug) {
      return NextResponse.json({ error: "Missing stepSlug." }, { status: 400 });
    }
    const supabase = createContentClient();
    const { data: step } = await supabase
      .from("steps")
      .select("title, summary, content_md, official_links")
      .eq("slug", slug)
      .maybeSingle();
    if (!step) {
      return NextResponse.json({ error: "Unknown step." }, { status: 404 });
    }

    system = `You answer questions about ONE step of the Germany Guide: "${step.title}".

Your only source of truth is the guide content below. If the answer is not in it, say plainly: "That is beyond what this guide covers. Check the official source linked on this page." Do not answer from general knowledge, even if you are confident.

GUIDE CONTENT:
${step.summary ?? ""}

${step.content_md}

${SHARED_RULES}
- Keep answers under 150 words.`;
    user = text;
  } else {
    return NextResponse.json({ error: "Unknown mode." }, { status: 400 });
  }

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: hasImage ? VISION_MODEL : MODEL,
        temperature: 0.2,
        // The vision model reasons before answering; give it headroom so the
        // reasoning tokens don't crowd out the actual answer (stripped below).
        max_tokens: hasImage ? 1400 : 700,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: hasImage
              ? [
                  { type: "text", text: user },
                  { type: "image_url", image_url: { url: imageDataUrl } },
                ]
              : user,
          },
        ],
      }),
    });

    if (groqRes.status === 429) {
      return NextResponse.json(
        { error: "The helper is busy right now. Try again in a minute." },
        { status: 429 },
      );
    }
    if (!groqRes.ok) {
      // Surface the real upstream reason in the server logs — a swallowed
      // error here is what let a decommissioned vision model fail silently.
      const detail = await groqRes.text().catch(() => "");
      console.error(
        `Groq ${groqRes.status} (${hasImage ? VISION_MODEL : MODEL}): ${detail.slice(0, 500)}`,
      );
      return NextResponse.json(
        { error: "The helper hit a problem. Try again shortly." },
        { status: 502 },
      );
    }

    const data = (await groqRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    // Reasoning models (e.g. qwen) wrap their chain-of-thought in
    // <think>…</think> before the real answer — strip it so the user never
    // sees the model thinking out loud.
    const answer = data.choices?.[0]?.message?.content
      ?.replace(/<think>[\s\S]*?<\/think>/gi, "")
      .trim();
    if (!answer) {
      return NextResponse.json(
        { error: "No answer came back. Try again." },
        { status: 502 },
      );
    }
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      { error: "Could not reach the helper. Try again shortly." },
      { status: 502 },
    );
  }
}
