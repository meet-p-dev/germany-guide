import { z } from "zod";

/**
 * Zod schemas for LLM-generated content. Generation scripts demand JSON-only
 * output from the model and reject anything that fails these schemas, so a
 * malformed response can never reach the database.
 */

export const sourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  accessed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const guideSchema = z.object({
  intro_md: z.string().min(100),
  documents_md: z.string().min(20),
  after_md: z.string().min(20),
  legal_basis: z.string().nullable(),
  steps: z
    .array(
      z.object({
        title_en: z.string().min(3),
        body_md: z.string().min(10),
        doc_names: z.array(z.string()),
        is_optional: z.boolean(),
      })
    )
    .min(3)
    .max(12),
  sources: z.array(sourceSchema).min(1),
  /** free-text note flagging anything the reviewer should double-check */
  confidence_note: z.string(),
});

export const variantSchema = z.object({
  appointment_required: z.boolean().nullable(),
  walk_in_possible: z.boolean().nullable(),
  online_possible: z.boolean().nullable(),
  booking_url: z.string().url().nullable(),
  office_name: z.string().nullable(),
  office_address: z.string().nullable(),
  office_hours: z.string().nullable(),
  typical_wait_time: z.string().nullable(),
  fees_eur: z.number().nullable(),
  fees_note: z.string().nullable(),
  city_notes_md: z.string().nullable(),
  sources: z.array(sourceSchema).min(1),
  confidence_note: z.string(),
});

export const problemSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title_en: z.string().min(10),
  description_md: z.string().min(50),
  severity: z.enum(["low", "medium", "high"]),
  related_task_slugs: z.array(z.string()),
  solutions: z
    .array(
      z.object({
        title_en: z.string().min(5),
        body_md: z.string().min(30),
        effectiveness: z.enum(["official", "workaround", "last-resort"]),
        /** null = applies in every city */
        city_slug: z.string().nullable(),
      })
    )
    .min(1),
  sources: z.array(sourceSchema),
  confidence_note: z.string(),
});

export const letterSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title_de: z.string(),
  title_en: z.string(),
  sender: z.string(),
  what_it_means_md: z.string().min(50),
  what_to_do_md: z.string().min(30),
  deadline_note: z.string().nullable(),
  looks_like_md: z.string().nullable(),
  urgency: z.enum(["info", "action-needed", "urgent"]),
  related_task_slug: z.string().nullable(),
  sources: z.array(sourceSchema),
  confidence_note: z.string(),
});

export type GeneratedGuide = z.infer<typeof guideSchema>;
export type GeneratedVariant = z.infer<typeof variantSchema>;
export type GeneratedProblem = z.infer<typeof problemSchema>;
export type GeneratedLetter = z.infer<typeof letterSchema>;
