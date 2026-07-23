import { NextResponse } from "next/server";
import { demoProject } from "@/data/demo-project";
import { RenderError } from "@/lib/rendering/errors";
import { renderCarousel } from "@/lib/rendering/renderSlides";
import { z } from "zod";
import { assetCatalog } from "@/lib/assets/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const assetIds = new Set(assetCatalog.map((asset) => asset.id));
    const body = await request.json().catch(() => ({}));
    const payload = z.object({
      assetAssignments: z.record(z.string().max(80), z.string().max(80)).default({}),
    }).parse(body);
    for (const [slideId, assetId] of Object.entries(payload.assetAssignments)) {
      if (!demoProject.slides.some((slide) => slide.id === slideId) || !assetIds.has(assetId)) {
        return NextResponse.json({ error: "Selección de asset inválida.", code: "INVALID_ASSET_SELECTION" }, { status: 400 });
      }
    }
    const result = await renderCarousel({
      project: demoProject,
      baseUrl: new URL(request.url).origin,
      workspaceRoot: process.cwd(),
      assetAssignments: payload.assetAssignments,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error de exportación desconocido.";
    const code = error instanceof RenderError ? error.code : "EXPORT_FAILED";
    console.error(`[export:${code}] ${message}`);
    return NextResponse.json({ error: message, code }, { status: 422 });
  }
}
