import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { assetCatalog } from "@/lib/assets/catalog";
import { getProjectById, setProjectStatus } from "@/lib/projects/repository";
import { RenderError } from "@/lib/rendering/errors";
import { renderCarousel } from "@/lib/rendering/renderSlides";
import { demoProject } from "@/data/demo-project";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import type { CarouselProject } from "@/types/carousel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    if (!/^(project-[a-f0-9]{20}|kalliom-demo)$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    const payload = z.object({
      assetAssignments: z.record(z.string().max(80), z.string().max(80)).default({}),
      project: z.unknown().optional(),
    }).parse(await request.json().catch(() => ({})));
    const storedProject = projectId === demoProject.id ? demoProject : await getProjectById(projectId);
    if (!storedProject) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
    const project = projectId === demoProject.id && payload.project
      ? carouselProjectSchema.parse(payload.project) as CarouselProject
      : storedProject;
    if (project.id !== projectId) return NextResponse.json({ error: "El ID del proyecto no coincide." }, { status: 400 });
    const assetIds = new Set(assetCatalog.map((asset) => asset.id));
    for (const [slideId, assetId] of Object.entries(payload.assetAssignments)) {
      if (!project.slides.some((slide) => slide.id === slideId) || !assetIds.has(assetId)) return NextResponse.json({ error: "Selección de asset inválida." }, { status: 400 });
    }
    const result = await renderCarousel({ project, baseUrl: new URL(request.url).origin, workspaceRoot: process.cwd(), assetAssignments: payload.assetAssignments });
    if (projectId !== demoProject.id) await setProjectStatus(projectId, "exported");
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Solicitud de exportación inválida." }, { status: 400 });
    const message = error instanceof Error ? error.message : "Error de exportación.";
    const code = error instanceof RenderError ? error.code : "EXPORT_FAILED";
    console.error(`[export:${code}] ${message}`);
    return NextResponse.json({ error: message, code }, { status: 422 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (!/^(project-[a-f0-9]{20}|kalliom-demo)$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  const format = new URL(request.url).searchParams.get("format") ?? "pdf";
  if (format !== "pdf") return NextResponse.json({ error: "Solo está disponible la descarga en PDF." }, { status: 400 });
  const fileName = "carousel.pdf";
  const filePath = path.join(process.cwd(), "exports", projectId, fileName);
  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(data, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${projectId}-${fileName}"`,
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Primero debes exportar el proyecto." }, { status: 404 });
  }
}
