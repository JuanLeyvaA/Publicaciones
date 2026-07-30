import { createHash } from "node:crypto";
import type { CreateCarouselInput } from "@/lib/ai/schemas";

function normalizeText(value?: string) {
  return value?.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase() || undefined;
}

const GENERATION_VERSION = "editorial-quality-v2";

export function normalizeCarouselInput(input: CreateCarouselInput) {
  return {
    generationVersion: GENERATION_VERSION,
    topic: normalizeText(input.topic)!,
    customTitle: normalizeText(input.customTitle),
    slideCount: input.slideCount,
    category: input.category,
    language: input.language,
    tone: input.tone,
    callToAction: normalizeText(input.callToAction),
    editorialProfile: input.editorialProfile ?? "kalliom-professional",
    visualStyle: input.visualStyle ?? "balanced",
  };
}

export function createGenerationCacheKey(input: CreateCarouselInput) {
  const normalized = normalizeCarouselInput(input);
  const serialized = JSON.stringify(normalized);
  return { normalized, serialized, key: createHash("sha256").update(serialized).digest("hex") };
}
