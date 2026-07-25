import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getProjectById, updateProject } from "@/lib/projects/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (!/^project-[a-f0-9]{20}$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  const project = await getProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  return NextResponse.json({ project });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    if (!/^project-[a-f0-9]{20}$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    const body = await request.json();
    const project = await updateProject(projectId, body.project);
    if (!project) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "El proyecto contiene campos inválidos.", issues: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message === "PROJECT_ID_MISMATCH") {
      return NextResponse.json({ error: "El ID del proyecto no coincide." }, { status: 400 });
    }
    console.error(`[project:update] ${error instanceof Error ? error.message : "Unknown error"}`);
    return NextResponse.json({ error: "No fue posible guardar el proyecto." }, { status: 500 });
  }
}
