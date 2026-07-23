import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { assetCatalog } from "@/lib/assets/catalog";
import { getProjectById } from "@/lib/projects/repository";
import { RenderError } from "@/lib/rendering/errors";
import { renderCarousel } from "@/lib/rendering/renderSlides";
import { demoProject } from "@/data/demo-project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    if (!/^(project-[a-f0-9]{20}|kalliom-demo)$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    const project = projectId === demoProject.id ? demoProject : await getProjectById(projectId);
    if (!project) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
    const payload = z.object({ assetAssignments: z.record(z.string().max(80), z.string().max(80)).default({}) }).parse(await request.json().catch(() => ({})));
    const assetIds = new Set(assetCatalog.map((asset) => asset.id));
    for (const [slideId, assetId] of Object.entries(payload.assetAssignments)) {
      if (!project.slides.some((slide) => slide.id === slideId) || !assetIds.has(assetId)) return NextResponse.json({ error: "Selección de asset inválida." }, { status: 400 });
    }
    const result = await renderCarousel({ project, baseUrl: new URL(request.url).origin, workspaceRoot: process.cwd(), assetAssignments: payload.assetAssignments });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Solicitud de exportación inválida." }, { status: 400 });
    const message = error instanceof Error ? error.message : "Error de exportación.";
    const code = error instanceof RenderError ? error.code : "EXPORT_FAILED";
    console.error(`[export:${code}] ${message}`);
    return NextResponse.json({ error: message, code }, { status: 422 });
  }
}
