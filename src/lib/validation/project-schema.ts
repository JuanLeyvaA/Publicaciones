import { z } from "zod";
import { TEXT_LIMITS } from "@/lib/constants";
import { isTemplateCompatible } from "@/lib/templates/catalog";

const base = {
  id: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  order: z.number().int().nonnegative(),
  visualTags: z.array(z.string().min(1).max(40)).max(10),
  assetId: z.string().max(80).optional(),
  appearance: z.object({
    panelPosition: z.object({ x: z.number().finite().min(-1080).max(1080), y: z.number().finite().min(-1350).max(1350) }).optional(),
    elementPositions: z.record(z.string().min(1).max(80), z.object({ x: z.number().finite().min(-1080).max(1080), y: z.number().finite().min(-1350).max(1350) })).optional(),
    textSizes: z.record(z.string().min(1).max(80), z.object({ width: z.number().finite().min(40).max(1080), height: z.number().finite().min(30).max(1350) })).optional(),
    fontSizes: z.record(z.string().min(1).max(80), z.number().finite().min(1).max(300)).optional(),
    hiddenElements: z.array(z.string().min(1).max(80)).max(100).optional(),
    texts: z.object(Object.fromEntries(["coverKicker", "coverBadge", "displayWord", "contentKicker", "highlightLabel", "visualCaption", "step1", "step2", "step3", "closingKicker", "ctaLabel", "signature", "series"].map((key) => [key, z.string().max(100).optional()]))).optional(),
    showBackground: z.boolean().optional(), showDecor: z.boolean().optional(), showScene: z.boolean().optional(),
    showHeader: z.boolean().optional(), showFooter: z.boolean().optional(), showAsset: z.boolean().optional(),
    assetPlacement: z.enum(["left", "right", "top-left", "top-right", "bottom-left", "bottom-right", "center"]).optional(),
  }).optional(),
};

const slideSchema = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("cover"), templateId: z.enum(["cover", "cover-split", "cover-poster", "cover-minimal", "cover-frame", "cover-sidebar", "cover-stack", "cover-diagonal", "cover-grid", "cover-spotlight", "cover-terminal", "cover-bento", "cover-ribbon", "cover-portal", "cover-editorial", "cover-wave", "cover-typographic", "cover-collage", "cover-arch", "cover-radar", "cover-staircase"]), title: z.string().max(TEXT_LIMITS.cover.title), subtitle: z.string().max(TEXT_LIMITS.cover.subtitle) }),
  z.object({ ...base, type: z.literal("content"), templateId: z.enum(["content", "content-focus", "content-steps", "content-quote", "content-data", "content-cards", "content-timeline", "content-magazine", "content-blueprint", "content-console", "content-duo", "content-rings", "content-dashboard", "content-index", "content-spotlight", "content-wave", "content-radial", "content-staircase", "content-poster", "content-circuit", "content-collage"]), number: z.number().int().positive(), title: z.string().max(TEXT_LIMITS.content.title), body: z.string().max(TEXT_LIMITS.content.body), highlight: z.string().max(TEXT_LIMITS.content.highlight) }),
  z.object({ ...base, type: z.literal("closing"), templateId: z.enum(["closing", "closing-minimal", "closing-panel", "closing-question", "closing-brand", "closing-split", "closing-banner", "closing-orbit", "closing-stamp", "closing-window", "closing-horizon", "closing-grid", "closing-card", "closing-signal", "closing-editorial", "closing-wave", "closing-arch", "closing-radar", "closing-ticket", "closing-poster", "closing-collage"]), title: z.string().max(TEXT_LIMITS.closing.title), body: z.string().max(TEXT_LIMITS.closing.body), cta: z.string().max(TEXT_LIMITS.closing.cta) }),
]);

export const carouselProjectSchema = z.object({
  id: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/),
  topic: z.string().min(3).max(240),
  title: z.string().max(TEXT_LIMITS.cover.title),
  subtitle: z.string().max(TEXT_LIMITS.cover.subtitle),
  slideCount: z.number().int().min(3).max(10),
  category: z.enum(["automation", "web", "artificial-intelligence", "analytics", "business"]),
  language: z.enum(["es", "en"]),
  tone: z.enum(["educational", "direct", "professional"]),
  status: z.enum(["draft", "generated", "approved", "exported"]),
  editorialStatus: z.enum(["idea", "review", "approved", "scheduled", "published"]),
  editorialProfile: z.enum(["kalliom-professional", "educator", "opinion", "executive", "case-study"]),
  visualStyle: z.enum(["balanced", "minimal", "bold", "image-led", "text-led"]),
  contentState: z.enum(["new", "used", "discarded"]),
  scheduledAt: z.string().datetime().optional(),
  batchId: z.string().max(80).optional(),
  qualityReport: z.object({
    score: z.number().int().min(0).max(100),
    issues: z.array(z.object({
      code: z.string().min(1).max(80),
      severity: z.enum(["info", "warning", "error"]),
      message: z.string().min(1).max(300),
      slideId: z.string().max(80).optional(),
    })).max(30),
    checkedAt: z.string(),
  }),
  brand: z.object({ name: z.string().max(50), website: z.string().max(100) }),
  slides: z.array(slideSchema).min(3).max(10),
  linkedInCopy: z.string().max(3000),
  referenceImageUrls: z.array(z.string().regex(/^\/uploads\/[a-zA-Z0-9._-]+$/)).max(6),
}).superRefine((project, context) => {
  if (project.slides.length !== project.slideCount) context.addIssue({ code: "custom", path: ["slides"], message: "La cantidad de slides no coincide con slideCount." });
  if (project.slides[0]?.type !== "cover") context.addIssue({ code: "custom", path: ["slides", 0], message: "La primera página debe ser cover." });
  if (project.slides.at(-1)?.type !== "closing") context.addIssue({ code: "custom", path: ["slides", project.slides.length - 1], message: "La última página debe ser closing." });
  project.slides.forEach((slide, index) => {
    if (slide.order !== index) context.addIssue({ code: "custom", path: ["slides", index, "order"], message: "El orden debe ser consecutivo." });
    if (!isTemplateCompatible(slide.type, slide.templateId)) context.addIssue({ code: "custom", path: ["slides", index, "templateId"], message: "La plantilla no es compatible con el tipo de página." });
  });
});
