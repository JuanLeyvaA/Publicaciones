import { templatesForType } from "@/lib/templates/catalog";
import { artDirectionForCover, type ArtDirectionId } from "@/lib/templates/artDirection";
import type { CarouselProject, CarouselSlide, TemplateId, VisualStyle } from "@/types/carousel";

const preferences: Record<VisualStyle, Record<CarouselSlide["type"], TemplateId[]>> = {
  balanced: {
    cover: ["cover", "cover-frame", "cover-grid", "cover-sidebar", "cover-bento", "cover-editorial", "cover-wave", "cover-staircase", "cover-arch", "cover-collage", "cover-portal", "cover-ribbon"],
    content: ["content", "content-steps", "content-duo", "content-dashboard", "content-cards", "content-index", "content-wave", "content-staircase", "content-radial", "content-collage", "content-timeline", "content-magazine"],
    closing: ["closing", "closing-panel", "closing-card", "closing-split", "closing-grid", "closing-editorial", "closing-wave", "closing-ticket", "closing-arch", "closing-collage", "closing-horizon", "closing-orbit"],
  },
  minimal: {
    cover: ["cover-minimal", "cover-editorial", "cover-spotlight", "cover-stack", "cover-frame", "cover-arch", "cover-typographic", "cover-wave", "cover-sidebar", "cover-radar"],
    content: ["content-focus", "content-quote", "content-duo", "content-index", "content-spotlight", "content-poster", "content-radial", "content-wave", "content-magazine", "content-staircase"],
    closing: ["closing-minimal", "closing-question", "closing-horizon", "closing-editorial", "closing-card", "closing-arch", "closing-poster", "closing-wave", "closing-ticket", "closing-radar"],
  },
  bold: {
    cover: ["cover-poster", "cover-diagonal", "cover-ribbon", "cover-portal", "cover-bento", "cover-terminal", "cover-radar", "cover-collage", "cover-staircase", "cover-typographic", "cover-grid", "cover-arch"],
    content: ["content-quote", "content-data", "content-rings", "content-console", "content-magazine", "content-dashboard", "content-circuit", "content-collage", "content-staircase", "content-poster", "content-radial", "content-timeline"],
    closing: ["closing-question", "closing-orbit", "closing-signal", "closing-stamp", "closing-banner", "closing-window", "closing-radar", "closing-collage", "closing-poster", "closing-ticket", "closing-wave", "closing-arch"],
  },
  "image-led": {
    cover: ["cover-split", "cover-sidebar", "cover-portal", "cover-ribbon", "cover-poster", "cover-grid", "cover-collage", "cover-wave", "cover-radar", "cover-staircase", "cover-diagonal", "cover-bento"],
    content: ["content-data", "content-magazine", "content-rings", "content", "content-spotlight", "content-console", "content-collage", "content-wave", "content-radial", "content-circuit", "content-dashboard", "content-timeline"],
    closing: ["closing-orbit", "closing-signal", "closing-split", "closing-horizon", "closing-panel", "closing-window", "closing-collage", "closing-wave", "closing-radar", "closing-arch", "closing-ticket", "closing-stamp"],
  },
  "text-led": {
    cover: ["cover-minimal", "cover-editorial", "cover-terminal", "cover-stack", "cover-bento", "cover-typographic", "cover-staircase", "cover-frame", "cover-radar", "cover-arch"],
    content: ["content-focus", "content-blueprint", "content-index", "content-duo", "content-steps", "content-poster", "content-staircase", "content-circuit", "content-radial", "content-quote"],
    closing: ["closing-minimal", "closing-editorial", "closing-grid", "closing-card", "closing-stamp", "closing-poster", "closing-ticket", "closing-arch", "closing-radar", "closing-question"],
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

export function applyVisualStyle(project: CarouselProject, style: VisualStyle, recentlyUsedTemplateIds: readonly TemplateId[] = []): CarouselProject {
  const recentFrequency = recentlyUsedTemplateIds.reduce((frequency, id) => {
    frequency.set(id, (frequency.get(id) ?? 0) + 1);
    return frequency;
  }, new Map<TemplateId, number>());
  const recentDirectionFrequency = recentlyUsedTemplateIds.reduce((frequency, id) => {
    if (!id.startsWith("cover")) return frequency;
    const direction = artDirectionForCover(id);
    frequency.set(direction, (frequency.get(direction) ?? 0) + 1);
    return frequency;
  }, new Map<ArtDirectionId, number>());
  const usedInProject = new Set<TemplateId>();
  const slides = project.slides.map((slide) => {
    const preferred = preferences[style][slide.type];
    const compatible = new Set(templatesForType(slide.type).map((template) => template.id));
    const options = preferred.filter((id) => compatible.has(id));
    const ranked = options
      .map((id) => ({
        id,
        recentUses: recentFrequency.get(id) ?? 0,
        recentDirectionUses: slide.type === "cover" ? recentDirectionFrequency.get(artDirectionForCover(id)) ?? 0 : 0,
        rank: stableHash(`${project.id}:${project.topic}:${style}:${slide.type}:${id}`),
      }))
      .sort((left, right) => left.recentDirectionUses - right.recentDirectionUses || left.recentUses - right.recentUses || left.rank - right.rank);
    const unused = ranked.filter((option) => !usedInProject.has(option.id));
    const candidates = unused.length ? unused : ranked;
    const fewestDirectionUses = Math.min(...candidates.map((option) => option.recentDirectionUses));
    const leastRepeatedDirection = candidates.filter((option) => option.recentDirectionUses === fewestDirectionUses);
    const fewestRecentUses = Math.min(...leastRepeatedDirection.map((option) => option.recentUses));
    const pool = leastRepeatedDirection.filter((option) => option.recentUses === fewestRecentUses);
    const selected = pool[stableHash(`${project.id}:${slide.id}:${slide.order}`) % pool.length]!.id;
    usedInProject.add(selected);
    return {
      ...slide,
      templateId: selected,
      assetId: style === "text-led" || style === "minimal" ? undefined : slide.assetId,
    };
  }) as CarouselSlide[];
  return { ...project, visualStyle: style, status: "draft", slides };
}
