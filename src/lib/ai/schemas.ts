import { z } from "zod";
import { TEXT_LIMITS } from "@/lib/constants";

export const categorySchema = z.enum(["automation", "web", "artificial-intelligence", "analytics", "business"]);
export const languageSchema = z.enum(["es", "en"]);
export const toneSchema = z.enum(["educational", "direct", "professional"]);
const plainText = (minimum: number, maximum: number) => z.string().min(minimum).max(maximum)
  .refine((value) => !/<\/?[a-z][^>]*>/i.test(value), "No se permite HTML.");

export const createCarouselInputSchema = z.object({
  topic: z.string().trim().min(3).max(240),
  customTitle: z.string().trim().max(TEXT_LIMITS.cover.title).optional().transform((value) => value || undefined),
  slideCount: z.coerce.number().int().min(3).max(10),
  category: categorySchema,
  language: languageSchema,
  tone: toneSchema,
  callToAction: z.string().trim().max(TEXT_LIMITS.closing.cta).optional().transform((value) => value || undefined),
  editorialProfile: z.enum(["kalliom-professional", "educator", "opinion", "executive", "case-study"]).optional(),
  visualStyle: z.enum(["balanced", "minimal", "bold", "image-led", "text-led"]).optional(),
  scheduledAt: z.string().datetime().optional(),
  batchId: z.string().max(80).optional(),
  avoidTopics: z.array(z.string().min(1).max(240)).max(12).optional(),
}).strict();

const tags = z.array(z.string().min(1).max(40)).min(1).max(6);
const coverOutputSchema = z.object({
  type: z.literal("cover"),
  title: plainText(1, TEXT_LIMITS.cover.title),
  subtitle: plainText(1, TEXT_LIMITS.cover.subtitle),
  visualTags: tags,
}).strict();
const contentOutputSchema = z.object({
  type: z.literal("content"),
  number: z.number().int().positive(),
  title: plainText(1, TEXT_LIMITS.content.title),
  body: plainText(1, TEXT_LIMITS.content.body),
  highlight: plainText(1, TEXT_LIMITS.content.highlight),
  visualTags: tags,
}).strict();
const closingOutputSchema = z.object({
  type: z.literal("closing"),
  title: plainText(1, TEXT_LIMITS.closing.title),
  body: plainText(1, TEXT_LIMITS.closing.body),
  cta: plainText(1, TEXT_LIMITS.closing.cta),
  visualTags: tags,
}).strict();

export const aiCarouselSchema = z.object({
  title: plainText(1, TEXT_LIMITS.cover.title),
  subtitle: plainText(1, TEXT_LIMITS.cover.subtitle),
  category: categorySchema,
  slides: z.array(z.discriminatedUnion("type", [coverOutputSchema, contentOutputSchema, closingOutputSchema])).min(3).max(10),
  linkedin: z.object({
    hook: plainText(1, 400),
    body: plainText(1, 2100),
    question: plainText(1, 300),
    hashtags: z.array(z.string().regex(/^#[^\s#]+$/)).min(2).max(6),
  }).strict(),
}).strict();

export type CreateCarouselInput = z.infer<typeof createCarouselInputSchema>;
export type AiCarouselOutput = z.infer<typeof aiCarouselSchema>;

export function validateOutputForInput(input: CreateCarouselInput, output: AiCarouselOutput) {
  if (output.slides.length !== input.slideCount) throw new AiOutputError("INVALID_SLIDE_COUNT", `Se esperaban ${input.slideCount} páginas y se recibieron ${output.slides.length}.`);
  if (output.category !== input.category) throw new AiOutputError("INVALID_SCHEMA", "La categoría devuelta no coincide con la solicitud.");
  if (output.slides[0]?.type !== "cover") throw new AiOutputError("INVALID_SLIDE_ORDER", "La primera página debe ser cover.");
  if (output.slides.at(-1)?.type !== "closing") throw new AiOutputError("INVALID_SLIDE_ORDER", "La última página debe ser closing.");
  if (output.slides.slice(1, -1).some((slide) => slide.type !== "content")) throw new AiOutputError("INVALID_SLIDE_ORDER", "Las páginas intermedias deben ser content.");
  const numbers = output.slides.slice(1, -1).map((slide) => slide.type === "content" ? slide.number : 0);
  if (numbers.some((number, index) => number !== index + 1)) throw new AiOutputError("INVALID_SLIDE_ORDER", "La numeración de contenido debe ser consecutiva.");
  return output;
}

export class AiOutputError extends Error {
  constructor(public readonly code: "INVALID_JSON" | "INVALID_SCHEMA" | "INVALID_SLIDE_COUNT" | "INVALID_SLIDE_ORDER" | "MODEL_REFUSAL", message: string) {
    super(message);
    this.name = "AiOutputError";
  }
}
