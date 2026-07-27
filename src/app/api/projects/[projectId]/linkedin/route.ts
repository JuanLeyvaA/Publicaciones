import { NextResponse } from "next/server";
import { publishProjectToLinkedIn } from "@/lib/linkedin/publishProject";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (!/^project-[a-f0-9]{20}$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  try {
    const result = await publishProjectToLinkedIn(projectId, new URL(request.url).origin);
    return NextResponse.json({ published: true, postId: result.postId });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "No fue posible publicar en LinkedIn.",
    }, { status: 422 });
  }
}
