import { z } from "zod";
import { TEXT_LIMITS } from "@/lib/constants";

const base = {
  id: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  order: z.number().int().nonnegative(),
  visualTags: z.array(z.string().min(1).max(40)).max(10),
  assetId: z.string().max(80).optional(),
};

const slideSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("cover"), templateId: z.literal("cover"), title: z.string().min(1).max(TEXT_LIMITS.cover.title), subtitle: z.string().min(1).max(TEXT_LIMITS.cover.subtitle) }),
  z.object({ ...base, type: z.literal("content"), templateId: z.literal("content"), number: z.number().int().positive(), title: z.string().min(1).max(TEXT_LIMITS.content.title), body: z.string().min(1).max(TEXT_LIMITS.content.body), highlight: z.string().min(1).max(TEXT_LIMITS.content.highlight) }),
  z.object({ ...base, type: z.literal("closing"), templateId: z.literal("closing"), title: z.string().min(1).max(TEXT_LIMITS.closing.title), body: z.string().min(1).max(TEXT_LIMITS.closing.body), cta: z.string().min(1).max(TEXT_LIMITS.closing.cta) }),
]);

export const carouselProjectSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  topic: z.string().min(3).max(180),
  title: z.string().min(1).max(TEXT_LIMITS.cover.title),
  subtitle: z.string().min(1).max(TEXT_LIMITS.cover.subtitle),
  slideCount: z.number().int().min(3).max(10),
  category: z.enum(["automation", "web", "artificial-intelligence", "analytics", "business"]),
  language: z.enum(["es", "en"]),
  tone: z.enum(["educational", "direct", "professional"]),
  status: z.enum(["draft", "generated", "approved", "exported"]),
  brand: z.object({ name: z.string().min(1).max(50), website: z.string().min(1).max(100) }),
  slides: z.array(slideSchema).min(3).max(10),
  linkedInCopy: z.string().max(3000),
}).superRefine((project, context) => {
  if (project.slides.length !== project.slideCount) context.addIssue({ code: "custom", path: ["slides"], message: "La cantidad de slides no coincide con slideCount." });
  if (project.slides[0]?.type !== "cover") context.addIssue({ code: "custom", path: ["slides", 0], message: "La primera página debe ser cover." });
  if (project.slides.at(-1)?.type !== "closing") context.addIssue({ code: "custom", path: ["slides", project.slides.length - 1], message: "La última página debe ser closing." });
  project.slides.forEach((slide, index) => {
    if (slide.order !== index) context.addIssue({ code: "custom", path: ["slides", index, "order"], message: "El orden debe ser consecutivo." });
  });
});
