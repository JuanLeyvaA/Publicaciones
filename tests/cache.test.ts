import { describe, expect, it } from "vitest";
import type { AiCarouselOutput, CreateCarouselInput } from "@/lib/ai/schemas";
import type { CarouselModel } from "@/lib/ai/generateCarousel";
import { getOrGenerateCarousel, type CacheRecord, type GenerationRepository } from "@/lib/cache/generationCache";
import { createGenerationCacheKey } from "@/lib/cache/hashInput";

const input: CreateCarouselInput = {
  topic: "Automatización para pymes",
  customTitle: undefined,
  slideCount: 3,
  category: "automation",
  language: "es",
  tone: "professional",
  callToAction: "¿Qué automatizarías primero?",
};

const output: AiCarouselOutput = {
  title: "Automatización útil para pymes",
  subtitle: "Empieza por procesos concretos",
  category: "automation",
  slides: [
    { type: "cover", title: "Automatización útil para pymes", subtitle: "Empieza por procesos concretos", visualTags: ["automation"] },
    { type: "content", number: 1, title: "Elige una tarea repetitiva", body: "Empieza con un proceso frecuente, medible y sencillo de supervisar.", highlight: "Primero claridad, después tecnología.", visualTags: ["workflow"] },
    { type: "closing", title: "Automatiza para recuperar tiempo", body: "Usa ese tiempo en decisiones y conversaciones de mayor valor.", cta: "¿Qué automatizarías primero?", visualTags: ["business"] },
  ],
  linkedin: { hook: "Automatizar no empieza por una herramienta.", body: "Empieza por elegir bien el proceso.", question: "¿Qué automatizarías primero?", hashtags: ["#Automatización", "#Pymes"] },
};

class MemoryRepository implements GenerationRepository {
  records = new Map<string, CacheRecord & { normalizedInput: string; requestJson: string }>();
  async find(key: string) { return this.records.get(key) ?? null; }
  async save(record: CacheRecord & { normalizedInput: string; requestJson: string }) { this.records.set(record.key, record); }
}

describe("hash y caché de generación", () => {
  it("normaliza espacios y mayúsculas antes de calcular el hash", () => {
    const equivalent = { ...input, topic: "  AUTOMATIZACIÓN   PARA PYMES " };
    expect(createGenerationCacheKey(input).key).toBe(createGenerationCacheKey(equivalent).key);
  });

  it("hace una sola llamada y reutiliza el JSON en la segunda solicitud", async () => {
    const repository = new MemoryRepository();
    let calls = 0;
    const model: CarouselModel = {
      async generate() {
        calls++;
        return { output, raw: JSON.stringify(output), usage: { inputTokens: 100, outputTokens: 200, calls: 1, model: "fake-model" } };
      },
    };
    const dependencies = { repository, modelFactory: () => model };
    const first = await getOrGenerateCarousel(input, dependencies);
    const second = await getOrGenerateCarousel(input, { repository, modelFactory: () => { throw new Error("El modelo no debe instanciarse en cache hit."); } });
    expect(first.cached).toBe(false);
    expect(second.cached).toBe(true);
    expect(second.usage.calls).toBe(0);
    expect(second.output).toEqual(first.output);
    expect(calls).toBe(1);
  });
});
