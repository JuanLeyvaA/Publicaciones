import fs from "node:fs/promises";
import path from "node:path";
import { publishPdfToLinkedIn } from "@/lib/linkedin/client";
import {
  claimLinkedInPublication,
  getProjectById,
  markLinkedInError,
  markLinkedInPublished,
} from "@/lib/projects/repository";
import { renderCarousel } from "@/lib/rendering/renderSlides";

export async function publishProjectToLinkedIn(projectId: string, baseUrl: string) {
  const claimed = await claimLinkedInPublication(projectId);
  if (!claimed) throw new Error("La publicación ya fue enviada o está siendo procesada.");
  try {
    const project = await getProjectById(projectId);
    if (!project) throw new Error("Proyecto no encontrado.");
    const pdfPath = path.join(process.cwd(), "exports", project.id, "carousel.pdf");
    try {
      await fs.access(pdfPath);
    } catch {
      await renderCarousel({ project, baseUrl, workspaceRoot: process.cwd() });
    }
    const result = await publishPdfToLinkedIn({
      pdfPath,
      title: project.title,
      commentary: project.linkedInCopy,
    });
    await markLinkedInPublished(project.id, result.postId);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "No fue posible publicar en LinkedIn.";
    await markLinkedInError(projectId, message);
    throw error;
  }
}
