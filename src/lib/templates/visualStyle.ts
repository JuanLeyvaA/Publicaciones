import { templatesForType } from "@/lib/templates/catalog";
import type { CarouselProject, CarouselSlide, TemplateId, VisualStyle } from "@/types/carousel";

const preferences: Record<VisualStyle, Record<CarouselSlide["type"], TemplateId[]>> = {
  balanced: {
    cover: ["cover", "cover-frame", "cover-grid", "cover-sidebar", "cover-bento", "cover-editorial", "cover-wave", "cover-staircase"],
    content: ["content", "content-steps", "content-duo", "content-dashboard", "content-cards", "content-index", "content-wave", "content-staircase"],
    closing: ["closing", "closing-panel", "closing-card", "closing-split", "closing-grid", "closing-editorial", "closing-wave", "closing-ticket"],
  },
  minimal: {
    cover: ["cover-minimal", "cover-editorial", "cover-spotlight", "cover-stack", "cover-frame", "cover-arch", "cover-typographic"],
    content: ["content-focus", "content-quote", "content-duo", "content-index", "content-spotlight", "content-poster", "content-radial"],
    closing: ["closing-minimal", "closing-question", "closing-horizon", "closing-editorial", "closing-card", "closing-arch", "closing-poster"],
  },
  bold: {
    cover: ["cover-poster", "cover-diagonal", "cover-ribbon", "cover-portal", "cover-bento", "cover-terminal", "cover-radar", "cover-collage"],
    content: ["content-quote", "content-data", "content-rings", "content-console", "content-magazine", "content-dashboard", "content-circuit", "content-collage"],
    closing: ["closing-question", "closing-orbit", "closing-signal", "closing-stamp", "closing-banner", "closing-window", "closing-radar", "closing-collage"],
  },
  "image-led": {
    cover: ["cover-split", "cover-sidebar", "cover-portal", "cover-ribbon", "cover-poster", "cover-grid", "cover-collage", "cover-wave"],
    content: ["content-data", "content-magazine", "content-rings", "content", "content-spotlight", "content-console", "content-collage", "content-wave"],
    closing: ["closing-orbit", "closing-signal", "closing-split", "closing-horizon", "closing-panel", "closing-window", "closing-collage", "closing-wave"],
  },
  "text-led": {
    cover: ["cover-minimal", "cover-editorial", "cover-terminal", "cover-stack", "cover-bento", "cover-typographic", "cover-staircase"],
    content: ["content-focus", "content-blueprint", "content-index", "content-duo", "content-steps", "content-poster", "content-staircase"],
    closing: ["closing-minimal", "closing-editorial", "closing-grid", "closing-card", "closing-stamp", "closing-poster", "closing-ticket"],
  },
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  return (hash ^ hash >>> 16) >>> 0;
}

export function applyVisualStyle(project: CarouselProject, style: VisualStyle): CarouselProject {
  const slides = project.slides.map((slide) => {
    const preferred = preferences[style][slide.type];
    const compatible = new Set(templatesForType(slide.type).map((template) => template.id));
    const options = preferred.filter((id) => compatible.has(id));
    const offset = stableHash(`${project.id}:${project.topic}:${style}:${slide.type}`) % options.length;
    return {
      ...slide,
      templateId: options[(offset + slide.order) % options.length]!,
      assetId: style === "text-led" || style === "minimal" ? undefined : slide.assetId,
    };
  }) as CarouselSlide[];
  return { ...project, visualStyle: style, status: "draft", slides };
}
