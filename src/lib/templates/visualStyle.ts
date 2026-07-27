import { templatesForType } from "@/lib/templates/catalog";
import type { CarouselProject, CarouselSlide, TemplateId, VisualStyle } from "@/types/carousel";

const preferences: Record<VisualStyle, Record<CarouselSlide["type"], TemplateId[]>> = {
  balanced: {
    cover: ["cover", "cover-frame", "cover-split", "cover-stack"],
    content: ["content", "content-steps", "content-data", "content-cards"],
    closing: ["closing", "closing-panel", "closing-minimal", "closing-split"],
  },
  minimal: {
    cover: ["cover-minimal", "cover", "cover-poster", "cover-stack"],
    content: ["content-focus", "content-steps", "content-quote", "content-timeline"],
    closing: ["closing-minimal", "closing-question", "closing", "closing-banner"],
  },
  bold: {
    cover: ["cover-poster", "cover-frame", "cover-split", "cover-diagonal"],
    content: ["content-quote", "content-data", "content-steps", "content-magazine"],
    closing: ["closing-question", "closing-brand", "closing-panel", "closing-banner"],
  },
  "image-led": {
    cover: ["cover-split", "cover-frame", "cover-poster", "cover-sidebar"],
    content: ["content-data", "content", "content-steps", "content-magazine"],
    closing: ["closing-brand", "closing-panel", "closing", "closing-orbit"],
  },
  "text-led": {
    cover: ["cover-minimal", "cover", "cover-poster", "cover-stack"],
    content: ["content-focus", "content-quote", "content-steps", "content-timeline"],
    closing: ["closing-minimal", "closing-question", "closing-panel", "closing-split"],
  },
};

export function applyVisualStyle(project: CarouselProject, style: VisualStyle): CarouselProject {
  const slides = project.slides.map((slide) => {
    const preferred = preferences[style][slide.type];
    const compatible = new Set(templatesForType(slide.type).map((template) => template.id));
    const options = preferred.filter((id) => compatible.has(id));
    return {
      ...slide,
      templateId: options[slide.order % options.length]!,
      assetId: style === "text-led" || style === "minimal" ? undefined : slide.assetId,
    };
  }) as CarouselSlide[];
  return { ...project, visualStyle: style, status: "draft", slides };
}
