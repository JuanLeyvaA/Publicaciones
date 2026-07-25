import { NextResponse } from "next/server";
import { getProjectById, recentEditorialMemory, saveQualityReport } from "@/lib/projects/repository";
import { reviewProject } from "@/lib/quality/reviewProject";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (!/^project-[a-f0-9]{20}$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  const project = await getProjectById(projectId);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  const memory = (await recentEditorialMemory(20)).filter((entry) => !entry.startsWith(`${project.title} —`));
  const report = reviewProject(project, memory);
  await saveQualityReport(projectId, report);
  return NextResponse.json({ report });
}
