import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/projects/repository";
import { RenderError } from "@/lib/rendering/errors";
import { renderCarousel } from "@/lib/rendering/renderSlides";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (!/^project-[a-f0-9]{20}$/.test(projectId)) return NextResponse.json({ error: "Guarda el proyecto antes de validarlo." }, { status: 400 });
  const project = await getProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  try {
    const result = await renderCarousel({ project, baseUrl: new URL(request.url).origin, workspaceRoot: process.cwd(), persist: false });
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof RenderError ? error.code : "VALIDATION_FAILED";
    const message = error instanceof Error ? error.message : "No fue posible validar el proyecto.";
    return NextResponse.json({ code, error: message, validated: false }, { status: 422 });
  }
}
