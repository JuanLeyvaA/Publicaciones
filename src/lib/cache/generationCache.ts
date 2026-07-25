import { aiCarouselSchema, validateOutputForInput, type AiCarouselOutput, type CreateCarouselInput } from "@/lib/ai/schemas";
import { OpenAICarouselModel, type CarouselModel, type GenerationUsage } from "@/lib/ai/generateCarousel";
import { buildCarouselPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { createGenerationCacheKey } from "@/lib/cache/hashInput";
import { prisma } from "@/lib/db";

export type CacheRecord = {
  key: string;
  responseJson: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
};

export interface GenerationRepository {
  find(key: string): Promise<CacheRecord | null>;
  save(record: CacheRecord & { normalizedInput: string; requestJson: string }): Promise<void>;
}

export const prismaGenerationRepository: GenerationRepository = {
  async find(key) {
    return prisma.generationCache.findUnique({
      where: { key },
      select: { key: true, responseJson: true, model: true, inputTokens: true, outputTokens: true },
    });
  },
  async save(record) {
    await prisma.generationCache.upsert({
      where: { key: record.key },
      update: {
        normalizedInput: record.normalizedInput,
        requestJson: record.requestJson,
        responseJson: record.responseJson,
        model: record.model,
        inputTokens: record.inputTokens,
        outputTokens: record.outputTokens,
      },
      create: record,
    });
  },
};

type Dependencies = {
  repository?: GenerationRepository;
  modelFactory?: () => CarouselModel;
  beforeModelCall?: () => void | Promise<void>;
  force?: boolean;
};

export type CachedGenerationResult = {
  key: string;
  output: AiCarouselOutput;
  cached: boolean;
  usage: GenerationUsage;
};

const inFlight = new Map<string, Promise<CachedGenerationResult>>();

export async function getOrGenerateCarousel(input: CreateCarouselInput, dependencies: Dependencies = {}): Promise<CachedGenerationResult> {
  const repository = dependencies.repository ?? prismaGenerationRepository;
  const hash = createGenerationCacheKey(input);
  const cached = dependencies.force ? null : await repository.find(hash.key);
  if (cached) {
    const output = validateOutputForInput(input, aiCarouselSchema.parse(JSON.parse(cached.responseJson)));
    return {
      key: hash.key,
      output,
      cached: true,
      usage: { inputTokens: cached.inputTokens, outputTokens: cached.outputTokens, calls: 0, model: cached.model },
    };
  }
  const existing = inFlight.get(hash.key);
  if (existing) return existing;
  const promise = (async () => {
    await dependencies.beforeModelCall?.();
    const model = dependencies.modelFactory?.() ?? new OpenAICarouselModel();
    const generated = await model.generate(input);
    await repository.save({
      key: hash.key,
      normalizedInput: hash.serialized,
      requestJson: JSON.stringify({ system: SYSTEM_PROMPT, user: buildCarouselPrompt(input) }),
      responseJson: JSON.stringify(generated.output),
      model: generated.usage.model,
      inputTokens: generated.usage.inputTokens,
      outputTokens: generated.usage.outputTokens,
    });
    return { key: hash.key, output: generated.output, cached: false, usage: generated.usage };
  })();
  inFlight.set(hash.key, promise);
  try { return await promise; }
  finally { inFlight.delete(hash.key); }
}
