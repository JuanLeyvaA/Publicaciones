import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { TEXT_LIMITS } from "@/lib/constants";
import { getEditorialProfile } from "@/lib/editorial/profiles";
import type { CarouselProject, CarouselSlide } from "@/types/carousel";

export type RegenerationTarget =
  | { kind: "title" }
  | { kind: "slide"; slideId: string }
  | { kind: "cta" }
  | { kind: "linkedin" };

const text = (max: number) => z.string().min(1).max(max);
const titleSchema = z.object({ title: text(TEXT_LIMITS.cover.title) }).strict();
const ctaSchema = z.object({ cta: text(TEXT_LIMITS.closing.cta) }).strict();
const linkedinSchema = z.object({
  hook: text(300),
  body: text(1600),
  question: text(200),
  hashtags: z.array(z.string().regex(/^#[^\s#]+$/)).min(2).max(6),
}).strict();
const coverSchema = z.object({ title: text(TEXT_LIMITS.cover.title), subtitle: text(TEXT_LIMITS.cover.subtitle), visualTags: z.array(text(40)).min(1).max(6) }).strict();
const contentSchema = z.object({ title: text(TEXT_LIMITS.content.title), body: text(TEXT_LIMITS.content.body), highlight: text(TEXT_LIMITS.content.highlight), visualTags: z.array(text(40)).min(1).max(6) }).strict();
const closingSchema = z.object({ title: text(TEXT_LIMITS.closing.title), body: text(TEXT_LIMITS.closing.body), cta: text(TEXT_LIMITS.closing.cta), visualTags: z.array(text(40)).min(1).max(6) }).strict();

function schemaFor(target: RegenerationTarget, slide?: CarouselSlide) {
  if (target.kind === "title") return titleSchema;
  if (target.kind === "cta") return ctaSchema;
  if (target.kind === "linkedin") return linkedinSchema;
  if (slide?.type === "cover") return coverSchema;
  if (slide?.type === "content") return contentSchema;
  return closingSchema;
}

export async function regenerateProjectPart(project: CarouselProject, target: RegenerationTarget) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY_NOT_CONFIGURED");
  const slide = target.kind === "slide" ? project.slides.find((item) => item.id === target.slideId) : undefined;
  if (target.kind === "slide" && !slide) throw new Error("SLIDE_NOT_FOUND");
  const schema = schemaFor(target, slide);
  const model = process.env.OPENAI_MODEL ?? "gpt-5.6-luna";
  const context = {
    topic: project.topic,
    title: project.title,
    profile: getEditorialProfile(project.editorialProfile).prompt,
    slides: project.slides.map((item) => ({ id: item.id, type: item.type, title: item.title })),
    current: target.kind === "slide" ? slide : target.kind === "linkedin" ? project.linkedInCopy : undefined,
  };
  const response = await new OpenAI({ apiKey }).responses.parse({
    model,
    input: [
      {
        role: "system",
        content: "Reescribe únicamente el fragmento solicitado de un carrusel B2B. Aporta un ángulo más concreto y memorable, conserva coherencia con el resto y no inventes cifras, estudios ni testimonios. Devuelve solo la estructura solicitada.",
      },
      {
        role: "user",
        content: `Objetivo: regenerar ${target.kind}${target.kind === "slide" ? ` ${target.slideId}` : ""}.\nContexto: ${JSON.stringify(context)}\nNo repitas literalmente los títulos existentes.`,
      },
    ],
    reasoning: { effort: "low" },
    text: { verbosity: "low", format: zodTextFormat(schema, `kalliom_${target.kind}`) },
  });
  if (!response.output_parsed) throw new Error("PARTIAL_REGENERATION_FAILED");
  return {
    data: response.output_parsed,
    usage: {
      calls: 1,
      model,
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    },
  };
}
