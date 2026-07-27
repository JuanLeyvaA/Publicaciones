import { NextResponse } from "next/server";
import { linkedInConfiguration } from "@/lib/linkedin/client";
import { publishProjectToLinkedIn } from "@/lib/linkedin/publishProject";
import { listDueLinkedInProjects } from "@/lib/projects/repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

async function dispatch(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "Configura CRON_SECRET antes de activar el despachador." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!linkedInConfiguration().configured) {
    return NextResponse.json({ error: "LinkedIn no está conectado." }, { status: 503 });
  }
  const ids = await listDueLinkedInProjects(10);
  const published: Array<{ id: string; postId: string }> = [];
  const failures: Array<{ id: string; error: string }> = [];
  for (const id of ids) {
    try {
      const result = await publishProjectToLinkedIn(id, new URL(request.url).origin);
      published.push({ id, postId: result.postId });
    } catch (error) {
      failures.push({ id, error: error instanceof Error ? error.message : "Error desconocido." });
    }
  }
  return NextResponse.json({ checked: ids.length, published, failures });
}

export const GET = dispatch;
export const POST = dispatch;
