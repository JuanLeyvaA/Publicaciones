import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { toPublicOpenAIError } from "@/lib/ai/openaiError";
import { AiOutputError, createCarouselInputSchema } from "@/lib/ai/schemas";
import { getOrGenerateCarousel } from "@/lib/cache/generationCache";
import { persistGeneratedProject, recentEditorialMemory } from "@/lib/projects/repository";
import { assertGenerationRateLimit, RateLimitError } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload = createCarouselInputSchema.extend({ force: z.boolean().optional() }).parse(await request.json());
    const { force = false, ...rawInput } = payload;
    const input = {
      ...rawInput,
      avoidTopics: rawInput.avoidTopics?.length ? rawInput.avoidTopics : await recentEditorialMemory(),
    };
    const identifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const generation = await getOrGenerateCarousel(input, {
      beforeModelCall: () => assertGenerationRateLimit(identifier),
      force,
    });
    const project = await persistGeneratedProject(
      input,
      generation.key,
      generation.output,
      generation.usage.model,
      generation.usage.inputTokens + generation.usage.outputTokens,
    );
    return NextResponse.json({
      project,
      cached: generation.cached,
      usage: generation.usage,
    });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ code: "INVALID_INPUT", error: "Revisa los campos del formulario.", issues: error.issues }, { status: 400 });
    if (error instanceof RateLimitError) return NextResponse.json({ code: error.code, error: error.message }, { status: 429, headers: { "retry-after": String(error.retryAfterSeconds) } });
    if (error instanceof AiOutputError) return NextResponse.json({ code: error.code, error: error.message }, { status: 422 });
    if (error instanceof Error && error.message === "OPENAI_API_KEY_NOT_CONFIGURED") {
      return NextResponse.json({ code: error.message, error: "Configura OPENAI_API_KEY en .env.local para generar contenido." }, { status: 503 });
    }
    const openAIError = toPublicOpenAIError(error);
    if (openAIError) {
      console.error(`[generate:${openAIError.code}] status=${openAIError.status}`);
      return NextResponse.json(
        { code: openAIError.code, error: openAIError.message },
        { status: openAIError.status },
      );
    }
    console.error(`[generate:FAILED] ${error instanceof Error ? error.message : "Unknown error"}`);
    return NextResponse.json({ code: "GENERATION_FAILED", error: "No fue posible generar el carrusel." }, { status: 500 });
  }
}
