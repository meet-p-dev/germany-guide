/**
 * Shared plumbing for content-pipeline scripts. Run scripts with tsx:
 *   npx tsx scripts/generate-guide.ts --task anmeldung --source <url> [--source <url>...]
 *
 * Requires in .env.local (never deployed, never client-side):
 *   SUPABASE_SECRET_KEY   — service-role key (Supabase dashboard → settings → API)
 *   ANTHROPIC_API_KEY     — for generation scripts
 */
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Database } from "../lib/database.types";
import type { ZodSchema } from "zod";

// Minimal .env.local loader — avoids a dotenv dependency.
try {
  const env = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // no .env.local — rely on the environment
}

export const MODEL = "claude-fable-5";

export function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local"
    );
    process.exit(1);
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

export function anthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Missing ANTHROPIC_API_KEY in .env.local");
    process.exit(1);
  }
  return new Anthropic();
}

export function arg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

export function args(name: string): string[] {
  const out: string[] = [];
  process.argv.forEach((a, i) => {
    if (a === `--${name}` && process.argv[i + 1]) out.push(process.argv[i + 1]);
  });
  return out;
}

export function loadPrompt(name: string): string {
  return readFileSync(join(process.cwd(), "content-prompts", name), "utf8");
}

/** Fetch an official source page and strip it down to readable text. */
export async function fetchSourceText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (content research; contact site owner)" },
  });
  if (!res.ok) throw new Error(`${res.status} fetching ${url}`);
  const html = await res.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 30000);
}

/**
 * Call Claude, demand JSON-only output, validate against the given schema.
 * Retries once with the validation error appended so the model can fix it.
 */
export async function generateJson<T>(
  client: Anthropic,
  prompt: string,
  schema: ZodSchema<T>
): Promise<T> {
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      messages: [
        {
          role: "user",
          content:
            attempt === 0
              ? prompt
              : `${prompt}\n\nYour previous response failed validation:\n${lastError}\nReturn corrected JSON only.`,
        },
      ],
    });
    const text = message.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    try {
      const raw = JSON.parse(text.replace(/^```json?\n?|```$/g, "").trim());
      const parsed = schema.safeParse(raw);
      if (parsed.success) return parsed.data;
      lastError = JSON.stringify(parsed.error.issues, null, 2);
    } catch (e) {
      lastError = `Not valid JSON: ${e}`;
    }
    console.warn(`Attempt ${attempt + 1} failed validation, retrying…`);
  }
  throw new Error(`Model output failed validation twice:\n${lastError}`);
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
