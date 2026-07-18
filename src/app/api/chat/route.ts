import { NextResponse } from "next/server";
import { createContentClient } from "@/lib/supabase/content-client";

/**
 * Sitewide guide assistant.
 *
 * Answer ladder, in order of trust:
 * 1. The site's own verified content — a routing call picks the relevant
 *    pages, an answer call responds ONLY from them, linking each page.
 * 2. The open web via Tavily (TAVILY_API_KEY, optional) — clearly flagged
 *    `source: "web"` so the UI labels it "found on the web, verify", with
 *    the source links always shown. Official German domains are boosted.
 * 3. Neither available → an honest "not covered" with the best official
 *    starting point.
 *
 * Both keys are server-side only; without GROQ_API_KEY the route 503s and
 * the widget explains itself. Without TAVILY_API_KEY only rung 2 is skipped.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";
const MAX_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 2000;
const MAX_PAGES = 4;
const MAX_PAGE_CHARS = 4500;
const NOT_IN_GUIDE = "[NOT_IN_GUIDE]";

/** Domains whose results get ranked first in web answers. */
const OFFICIAL_HINTS = [
  "make-it-in-germany.com",
  "bamf.de",
  "auswaertiges-amt.de",
  "daad.de",
  "study-in-germany.de",
  "germany.info",
  ".bund.de",
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface IndexEntry {
  path: string;
  label: string;
}

async function groq(
  apiKey: string,
  system: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<string | null> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content?.trim() ?? null;
}

async function buildIndex(): Promise<IndexEntry[]> {
  const supabase = createContentClient();
  const [steps, letters, problems, citySteps] = await Promise.all([
    supabase.from("steps").select("slug, title, summary"),
    supabase.from("letters").select("slug, name, german_name"),
    supabase.from("problems").select("slug, title"),
    supabase.from("city_steps").select("steps(slug, title), cities(slug, name)"),
  ]);

  const index: IndexEntry[] = [];
  for (const s of steps.data ?? []) {
    index.push({
      path: `/guide/${s.slug}`,
      label: `${s.title}${s.summary ? ` — ${s.summary}` : ""}`,
    });
  }
  for (const l of letters.data ?? []) {
    index.push({
      path: `/letters/${l.slug}`,
      label: `Letter: ${l.name}${l.german_name ? ` (${l.german_name})` : ""}`,
    });
  }
  for (const p of problems.data ?? []) {
    index.push({ path: `/problems/${p.slug}`, label: `Problem: ${p.title}` });
  }
  for (const cs of citySteps.data ?? []) {
    if (!cs.steps || !cs.cities) continue;
    index.push({
      path: `/cities/${cs.cities.slug}/${cs.steps.slug}`,
      label: `${cs.steps.title} — how it works in ${cs.cities.name}`,
    });
  }
  return index;
}

async function fetchPage(path: string): Promise<string | null> {
  const supabase = createContentClient();
  const clip = (s: string) => s.slice(0, MAX_PAGE_CHARS);

  const guide = path.match(/^\/guide\/([\w-]+)$/);
  if (guide) {
    const { data } = await supabase
      .from("steps")
      .select("title, summary, content_md")
      .eq("slug", guide[1])
      .maybeSingle();
    if (!data) return null;
    return `PAGE ${path} — ${data.title}\n${data.summary ?? ""}\n${clip(data.content_md)}`;
  }

  const letter = path.match(/^\/letters\/([\w-]+)$/);
  if (letter) {
    const { data } = await supabase
      .from("letters")
      .select("name, what_it_is_md, what_to_do_md")
      .eq("slug", letter[1])
      .maybeSingle();
    if (!data) return null;
    return `PAGE ${path} — ${data.name}\nWhat it is: ${clip(data.what_it_is_md)}\nWhat to do: ${clip(data.what_to_do_md)}`;
  }

  const problem = path.match(/^\/problems\/([\w-]+)$/);
  if (problem) {
    const { data } = await supabase
      .from("problems")
      .select("title, problem_md, solution_md")
      .eq("slug", problem[1])
      .maybeSingle();
    if (!data) return null;
    return `PAGE ${path} — ${data.title}\nProblem: ${clip(data.problem_md)}\nSolution: ${clip(data.solution_md)}`;
  }

  const city = path.match(/^\/cities\/([\w-]+)\/([\w-]+)$/);
  if (city) {
    const { data } = await supabase
      .from("city_steps")
      .select(
        "content_md, method, method_note, address, last_verified, cities!inner(slug, name), steps!inner(slug, title)",
      )
      .eq("cities.slug", city[1])
      .eq("steps.slug", city[2])
      .maybeSingle();
    if (!data) return null;
    return `PAGE ${path} — ${data.steps!.title} in ${data.cities!.name} (method: ${data.method ?? "unknown"}${data.method_note ? `, ${data.method_note}` : ""}; last verified ${data.last_verified ?? "n/a"})\n${data.address ? `Address: ${data.address}\n` : ""}${clip(data.content_md)}`;
  }

  return null;
}

async function webSearch(
  tavilyKey: string,
  query: string,
): Promise<{ title: string; url: string; content: string }[] | null> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tavilyKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      max_results: 6,
      search_depth: "basic",
      include_answer: false,
    }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    results?: { title: string; url: string; content: string }[];
  };
  const results = data.results ?? [];
  // Official sources first — the user may have chosen the open web, but
  // trust order is still ours to set.
  return results.sort((a, b) => {
    const rank = (u: string) =>
      OFFICIAL_HINTS.some((d) => u.includes(d)) ? 0 : 1;
    return rank(a.url) - rank(b.url);
  });
}

const SHARED_RULES = `You write for stressed newcomers to Germany. Plain English, calm, short sentences. No emojis. NEVER invent fees, deadlines, laws or office names that are not in the provided material. End every answer with: "General information, not legal advice."`;

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The assistant is not configured." },
      { status: 503 },
    );
  }

  let raw: { messages?: { role?: string; content?: string }[] };
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const messages: ChatMessage[] = (raw.messages ?? [])
    .filter(
      (m): m is { role: "user" | "assistant"; content: string } =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  const question = messages.filter((m) => m.role === "user").at(-1)?.content;
  if (!question) {
    return NextResponse.json({ error: "No question found." }, { status: 400 });
  }

  // ---- Rung 1a: route the question to site pages -------------------------
  const index = await buildIndex();
  const routing = await groq(
    apiKey,
    `You route questions about moving to Germany to pages of the Germany Guide website. Given the question, reply with ONLY a JSON object: {"paths": [up to ${MAX_PAGES} page paths from the list that likely answer it]}. Use an empty list if nothing fits. No other text.

PAGES:
${index.map((e) => `${e.path} · ${e.label}`).join("\n")}`,
    [{ role: "user", content: question }],
    200,
  );

  let paths: string[] = [];
  const jsonMatch = routing?.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { paths?: unknown };
      if (Array.isArray(parsed.paths)) {
        paths = parsed.paths
          .filter((p): p is string => typeof p === "string")
          .filter((p) => index.some((e) => e.path === p))
          .slice(0, MAX_PAGES);
      }
    } catch {
      // Unparseable routing → fall through to the web rung.
    }
  }

  // ---- Rung 1b: answer from the site's own pages -------------------------
  if (paths.length > 0) {
    const pages = (await Promise.all(paths.map(fetchPage))).filter(
      (p): p is string => p !== null,
    );
    if (pages.length > 0) {
      const answer = await groq(
        apiKey,
        `You are the assistant of Germany Guide (germanyguide.net). Answer the user's question using ONLY the guide pages below. Link every page you drew from, inline, as a markdown link on its path (e.g. [Anmeldung](/guide/anmeldung)). Keep answers under 180 words.

If the pages do not actually contain the answer, reply with exactly ${NOT_IN_GUIDE} and nothing else.

${SHARED_RULES}

GUIDE PAGES:
${pages.join("\n\n---\n\n")}`,
        messages,
        600,
      );
      if (answer && !answer.includes(NOT_IN_GUIDE)) {
        return NextResponse.json({ answer, source: "site" });
      }
    }
  }

  // ---- Rung 2: the open web, clearly labeled -----------------------------
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (tavilyKey) {
    const results = await webSearch(
      tavilyKey,
      /german|germany/i.test(question) ? question : `${question} Germany`,
    );
    if (results && results.length > 0) {
      const answer = await groq(
        apiKey,
        `You answer questions about moving to Germany using ONLY the web search results below. Rules:
- Every claim must cite its source inline as a markdown link on the real URL.
- Prefer official sources (government, make-it-in-germany, DAAD) over blogs when they conflict, and say so if they conflict.
- If the results don't answer the question, say so plainly and suggest where to look.
- Keep it under 180 words.
${SHARED_RULES}

SEARCH RESULTS:
${results
  .map((r) => `SOURCE: ${r.title} — ${r.url}\n${r.content.slice(0, 1200)}`)
  .join("\n\n---\n\n")}`,
        messages,
        600,
      );
      if (answer) {
        return NextResponse.json({
          answer,
          source: "web",
          links: results.slice(0, 3).map((r) => ({ title: r.title, url: r.url })),
        });
      }
    }
  }

  // ---- Rung 3: honest fallback -------------------------------------------
  return NextResponse.json({
    answer:
      "That one isn't covered in the guide yet" +
      (tavilyKey ? " and the web search came up empty" : "") +
      ". The best official starting point is [Make it in Germany](https://www.make-it-in-germany.com/en/) — the German government's portal for internationals.\n\nGeneral information, not legal advice.",
    source: "site",
  });
}
