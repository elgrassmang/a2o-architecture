import { z } from "zod";
import { OUTPUT_TYPES } from "@/lib/output-types";

/** Remove control characters (except newline/tab) and collapse trailing whitespace. */
export function sanitizeText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();
}

const text = (max: number, min = 0) =>
  z
    .string()
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(min, min > 0 ? `Required (at least ${min} characters)` : undefined)
        .max(max, `Must be ${max} characters or fewer`),
    );

export const outputTypeSchema = z.enum(OUTPUT_TYPES);

export const projectParamsSchema = z.object({
  projectName: text(120, 1),
  scope: text(1000, 1),
  occupancy: text(80),
  jurisdiction: text(120),
  specifics: text(4000),
});
export type ProjectParams = z.infer<typeof projectParamsSchema>;

export const generateInputSchema = z.object({
  type: outputTypeSchema,
  brief: text(4000, 10),
  params: projectParamsSchema,
  /** Optional saved output to use as the starting point. */
  startingPoint: text(40000).optional(),
});
export type GenerateInput = z.infer<typeof generateInputSchema>;

export const savedOutputCreateSchema = z.object({
  type: outputTypeSchema,
  title: text(160, 1),
  projectName: text(120, 1),
  brief: text(4000),
  params: projectParamsSchema,
  body: text(60000, 1),
  tags: z.array(text(40, 1)).max(20).default([]),
  generationId: z.string().max(64).optional(),
});
export type SavedOutputCreate = z.infer<typeof savedOutputCreateSchema>;

export const savedOutputUpdateSchema = savedOutputCreateSchema
  .pick({ title: true, body: true, tags: true })
  .partial();

export const librarySearchSchema = z.object({
  q: text(200).default(""),
  type: outputTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

/** Turn a zod error into a short, user-facing message. */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((i) => `${i.path.join(".") || "input"}: ${i.message}`)
    .join("; ");
}
