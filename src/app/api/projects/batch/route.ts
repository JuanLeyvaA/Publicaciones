import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { createCarouselInputSchema } from "@/lib/ai/schemas";
import { getOrGenerateCarousel } from "@/lib/cache/generationCache";
import { persistGeneratedProject, recentEditorialMemory } from "@/lib/projects/repository";
import { assertGenerationRateLimit, RateLimitError } from "@/lib/security/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export const batchSchema = z.object({
  topics: z.array(z.string().trim().min(3).max(180)).min(1).max(20),
  slideCount: z.coerce.number().int().min(3).max(10),
  category: z.enum(["automation", "web", "artificial-intelligence", "analytics", "business"]),
  language: z.enum(["es", "en"]),
  tone: z.enum(["educational", "direct", "professional"]),
  editorialProfile: z.enum(["kalliom-professional", "educator", "opinion", "executive", "case-study"]),
  visualStyle: z.enum(["balanced", "minimal", "bold", "image-led", "text-led"]),
  startDate: z.string().datetime().optional(),
  intervalDays: z.coerce.number().int().min(0).max(30).default(1),
  force: z.boolean().default(false),
}).strict();

export async function POST(request: Request) {
  try {
    const payload = batchSchema.parse(await request.json());
    const batchId = `batch-${randomUUID()}`;
    const memory = await recentEditorialMemory();
    const generatedTitles: string[] = [];
    const projects = [];
    const failures: Array<{ topic: string; error: string }> = [];
    let calls = 0;
    let inputTokens = 0;
    let outputTokens = 0;

    for (const [index, topic] of payload.topics.entries()) {
      try {
        const scheduledAt = payload.startDate
          ? new Date(new Date(payload.startDate).getTime() + index * payload.intervalDays * 86_400_000).toISOString()
          : undefined;
        const input = createCarouselInputSchema.parse({
          topic,
          slideCount: payload.slideCount,
          category: payload.category,
          language: payload.language,
          tone: payload.tone,
          editorialProfile: payload.editorialProfile,
          visualStyle: payload.visualStyle,
          scheduledAt,
          batchId,
          avoidTopics: [...memory, ...generatedTitles].slice(-12),
        });
        const generation = await getOrGenerateCarousel(input, {
          beforeModelCall: () => assertGenerationRateLimit("local-batch"),
          force: payload.force,
        });
        const project = await persistGeneratedProject(
          input,
          generation.key,
          generation.output,
          generation.usage.model,
          generation.usage.inputTokens + generation.usage.outputTokens,
        );
        projects.push(project);
        generatedTitles.push(project.title);
        calls += generation.usage.calls;
        inputTokens += generation.usage.inputTokens;
        outputTokens += generation.usage.outputTokens;
      } catch (error) {
        failures.push({ topic, error: error instanceof Error ? error.message : "No fue posible generar." });
      }
    }

    return NextResponse.json({
      batchId,
      projects,
      failures,
      usage: { calls, inputTokens, outputTokens },
    }, { status: projects.length ? 200 : 422 });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Revisa los datos del lote.", issues: error.issues }, { status: 400 });
    if (error instanceof RateLimitError) return NextResponse.json({ error: error.message }, { status: 429 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "No fue posible generar el lote." }, { status: 500 });
  }
}
