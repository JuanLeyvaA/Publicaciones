import { NextResponse } from "next/server";
import { z } from "zod";
import { updateContentState } from "@/lib/projects/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  contentState: z.enum(["new", "used", "discarded"]),
}).strict();

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    if (!/^project-[a-f0-9]{20}$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    const input = inputSchema.parse(await request.json());
    return NextResponse.json({ project: await updateContentState(projectId, input.contentState) });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    console.error(`[project:state] ${error instanceof Error ? error.message : "Unknown error"}`);
    return NextResponse.json({ error: "No fue posible mover la publicación." }, { status: 500 });
  }
}
