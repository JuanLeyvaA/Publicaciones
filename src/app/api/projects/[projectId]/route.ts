import { NextResponse } from "next/server";
import { getProjectById } from "@/lib/projects/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (!/^project-[a-f0-9]{20}$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  const project = await getProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  return NextResponse.json({ project });
}
