import { createHash } from "node:crypto";
import type { CreateCarouselInput } from "@/lib/ai/schemas";

function normalizeText(value?: string) {
  return value?.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase() || undefined;
}

export function normalizeCarouselInput(input: CreateCarouselInput) {
  return {
    topic: normalizeText(input.topic)!,
    customTitle: normalizeText(input.customTitle),
    slideCount: input.slideCount,
    category: input.category,
    language: input.language,
    tone: input.tone,
    callToAction: normalizeText(input.callToAction),
  };
}

export function createGenerationCacheKey(input: CreateCarouselInput) {
  const normalized = normalizeCarouselInput(input);
  const serialized = JSON.stringify(normalized);
  return { normalized, serialized, key: createHash("sha256").update(serialized).digest("hex") };
}
