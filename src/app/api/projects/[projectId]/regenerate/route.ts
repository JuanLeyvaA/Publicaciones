import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { regenerateProjectPart, type RegenerationTarget } from "@/lib/ai/regeneratePart";
import { getProjectById, updateProject } from "@/lib/projects/repository";
import type { CarouselProject, CarouselSlide } from "@/types/carousel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const targetSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("title") }),
  z.object({ kind: z.literal("slide"), slideId: z.string().min(1).max(80) }),
  z.object({ kind: z.literal("cta") }),
  z.object({ kind: z.literal("linkedin") }),
]);

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    if (!/^project-[a-f0-9]{20}$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    const target = targetSchema.parse(await request.json()) as RegenerationTarget;
    const project = await getProjectById(projectId);
    if (!project) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
    const result = await regenerateProjectPart(project, target);
    let next: CarouselProject = { ...project, status: "draft" };

    if (target.kind === "title") {
      const data = result.data as { title: string };
      next = {
        ...next,
        title: data.title,
        slides: next.slides.map((slide, index) => index === 0 && slide.type === "cover" ? { ...slide, title: data.title } : slide),
      };
    } else if (target.kind === "cta") {
      const data = result.data as { cta: string };
      next = { ...next, slides: next.slides.map((slide) => slide.type === "closing" ? { ...slide, cta: data.cta } : slide) };
    } else if (target.kind === "linkedin") {
      const data = result.data as { hook: string; body: string; question: string; hashtags: string[] };
      next = { ...next, linkedInCopy: [data.hook, data.body, data.question, data.hashtags.join(" ")].join("\n\n") };
    } else {
      const current = next.slides.find((slide) => slide.id === target.slideId)!;
      const data = result.data as Record<string, unknown>;
      const replacement = { ...current, ...data, id: current.id, type: current.type, order: current.order, templateId: current.templateId, assetId: current.assetId } as CarouselSlide;
      next = { ...next, slides: next.slides.map((slide) => slide.id === target.slideId ? replacement : slide) };
      if (replacement.type === "cover") {
        next = { ...next, title: replacement.title, subtitle: replacement.subtitle };
      }
    }

    const saved = await updateProject(projectId, next);
    return NextResponse.json({ project: saved, usage: result.usage });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Objetivo de regeneración inválido.", issues: error.issues }, { status: 400 });
    if (error instanceof Error && error.message === "OPENAI_API_KEY_NOT_CONFIGURED") return NextResponse.json({ error: "Configura OPENAI_API_KEY para regenerar contenido." }, { status: 503 });
    return NextResponse.json({ error: error instanceof Error ? error.message : "No fue posible regenerar el fragmento." }, { status: 500 });
  }
}
