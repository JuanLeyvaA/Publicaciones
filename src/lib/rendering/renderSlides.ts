import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/constants";
import { RenderError } from "@/lib/rendering/errors";
import { createPdfFromPngs } from "@/lib/rendering/createPdf";
import { validateDimensions } from "@/lib/rendering/validateDimensions";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import type { CarouselProject, OverflowIssue } from "@/types/carousel";
import { assetCatalog, getAssetById } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";

type ExportOptions = { project: CarouselProject; baseUrl: string; workspaceRoot: string; assetAssignments?: Record<string, string> };

function launchOptions() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || process.env.CHROME_PATH;
  return executablePath ? { executablePath, headless: true as const } : { headless: true as const };
}

export async function renderCarousel({ project: rawProject, baseUrl, workspaceRoot, assetAssignments = {} }: ExportOptions) {
  const validatedProject = carouselProjectSchema.parse(rawProject) as CarouselProject;
  const automaticAssignments = assignAssetsToProject(validatedProject, assetCatalog);
  const project: CarouselProject = {
    ...validatedProject,
    slides: validatedProject.slides.map((slide) => {
      const requested = assetAssignments[slide.id];
      const assetId = getAssetById(requested)?.id ?? automaticAssignments[slide.id];
      return { ...slide, assetId };
    }),
  };
  const staging = await fs.mkdtemp(path.join(os.tmpdir(), "kalliom-export-"));
  const slidesDirectory = path.join(staging, "slides");
  await fs.mkdir(slidesDirectory, { recursive: true });
  const browser = await chromium.launch(launchOptions());
  const pngPaths: string[] = [];

  try {
    const page = await browser.newPage({ viewport: { width: SLIDE_WIDTH, height: SLIDE_HEIGHT }, deviceScaleFactor: 1 });
    for (const slide of project.slides) {
      const assetQuery = slide.assetId ? `?asset=${encodeURIComponent(slide.assetId)}` : "";
      const url = `${baseUrl}/render/${encodeURIComponent(project.id)}/${encodeURIComponent(slide.id)}${assetQuery}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await page.evaluate(async () => { await document.fonts.ready; });
      const assetsReady = await page.evaluate(() => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0));
      if (!assetsReady) throw new RenderError("ASSET_NOT_LOADED", `Uno o más assets no cargaron en ${slide.id}.`);
      const canvas = page.locator("#slide-canvas");
      if (await canvas.count() !== 1) throw new RenderError("CANVAS_NOT_FOUND", `No se encontró un único canvas en ${slide.id}.`);
      const box = await canvas.boundingBox();
      if (!box || Math.round(box.width) !== SLIDE_WIDTH || Math.round(box.height) !== SLIDE_HEIGHT) throw new RenderError("INVALID_SLIDE_DIMENSIONS", `El canvas DOM de ${slide.id} no mide ${SLIDE_WIDTH}×${SLIDE_HEIGHT}.`);
      const issues = await canvas.evaluate((root): OverflowIssue[] => {
        const rootRect = root.getBoundingClientRect();
        const safe = root.querySelector("[data-safe-area]")?.getBoundingClientRect() ?? rootRect;
        return Array.from(root.querySelectorAll<HTMLElement>("[data-overflow-check]")).flatMap((element) => {
          const rect = element.getBoundingClientRect();
          const name = element.dataset.overflowCheck || element.tagName.toLowerCase();
          const result: OverflowIssue[] = [];
          if (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1) result.push({ element: name, reason: "content-overflow" });
          if (rect.left < rootRect.left - 1 || rect.top < rootRect.top - 1 || rect.right > rootRect.right + 1 || rect.bottom > rootRect.bottom + 1) result.push({ element: name, reason: "outside-canvas" });
          if (rect.left < safe.left - 1 || rect.top < safe.top - 1 || rect.right > safe.right + 1 || rect.bottom > safe.bottom + 1) result.push({ element: name, reason: "outside-safe-area" });
          return result;
        });
      });
      if (issues.length) throw new RenderError("SLIDE_OVERFLOW", `Overflow en ${slide.id}: ${issues.map((issue) => `${issue.element}:${issue.reason}`).join(", ")}`);
      const pngPath = path.join(slidesDirectory, `slide-${String(slide.order + 1).padStart(2, "0")}.png`);
      await canvas.screenshot({ path: pngPath, type: "png", animations: "disabled" });
      await validateDimensions(pngPath);
      pngPaths.push(pngPath);
    }
  } finally { await browser.close(); }

  const pdfPath = path.join(staging, "carousel.pdf");
  await createPdfFromPngs(pngPaths, pdfPath);
  await fs.writeFile(path.join(staging, "carousel-data.json"), `${JSON.stringify(project, null, 2)}\n`);
  await fs.writeFile(path.join(staging, "linkedin-copy.txt"), `${project.linkedInCopy.trim()}\n`);

  const exportsRoot = path.join(workspaceRoot, "exports");
  const finalDirectory = path.join(exportsRoot, project.id);
  await fs.mkdir(exportsRoot, { recursive: true });
  await fs.rm(finalDirectory, { recursive: true, force: true });
  await fs.cp(staging, finalDirectory, { recursive: true, errorOnExist: true });
  await fs.rm(staging, { recursive: true, force: true });
  return { directory: finalDirectory, slideCount: pngPaths.length, pdfPath: path.join(finalDirectory, "carousel.pdf") };
}
