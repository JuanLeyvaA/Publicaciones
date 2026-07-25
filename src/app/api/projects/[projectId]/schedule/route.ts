import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { updateEditorialSchedule } from "@/lib/projects/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    if (!/^project-[a-f0-9]{20}$/.test(projectId)) return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    const payload = z.object({
      editorialStatus: z.enum(["idea", "review", "approved", "scheduled", "published"]),
      scheduledAt: z.string().datetime().optional(),
    }).strict().parse(await request.json());
    if (payload.editorialStatus === "scheduled" && !payload.scheduledAt) {
      return NextResponse.json({ error: "Una publicación programada necesita fecha." }, { status: 400 });
    }
    const project = await updateEditorialSchedule(projectId, payload);
    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof ZodError) return NextResponse.json({ error: "Estado o fecha inválidos.", issues: error.issues }, { status: 400 });
    return NextResponse.json({ error: "No fue posible actualizar el calendario." }, { status: 500 });
  }
}
