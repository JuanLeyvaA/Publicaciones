import { templatesForType } from "@/lib/templates/catalog";
import type { CarouselProject, CarouselSlide, TemplateId, VisualStyle } from "@/types/carousel";

const preferences: Record<VisualStyle, Record<CarouselSlide["type"], TemplateId[]>> = {
  balanced: {
    cover: ["cover", "cover-frame", "cover-split"],
    content: ["content", "content-steps", "content-data"],
    closing: ["closing", "closing-panel", "closing-minimal"],
  },
  minimal: {
    cover: ["cover-minimal", "cover", "cover-poster"],
    content: ["content-focus", "content-steps", "content-quote"],
    closing: ["closing-minimal", "closing-question", "closing"],
  },
  bold: {
    cover: ["cover-poster", "cover-frame", "cover-split"],
    content: ["content-quote", "content-data", "content-steps"],
    closing: ["closing-question", "closing-brand", "closing-panel"],
  },
  "image-led": {
    cover: ["cover-split", "cover-frame", "cover-poster"],
    content: ["content-data", "content", "content-steps"],
    closing: ["closing-brand", "closing-panel", "closing"],
  },
  "text-led": {
    cover: ["cover-minimal", "cover", "cover-poster"],
    content: ["content-focus", "content-quote", "content-steps"],
    closing: ["closing-minimal", "closing-question", "closing-panel"],
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
