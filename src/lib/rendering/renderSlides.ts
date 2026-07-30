import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/constants";
import { RenderError } from "@/lib/rendering/errors";
import { createPdfFromPngs } from "@/lib/rendering/createPdf";
import { validateDimensions } from "@/lib/rendering/validateDimensions";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import type { CarouselProject, OverflowIssue } from "@/types/carousel";
import { getAssetById, recommendedAssetCatalog } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";
import type { CarouselSlide, TemplateId } from "@/types/carousel";

type ExportOptions = { project: CarouselProject; baseUrl: string; workspaceRoot: string; assetAssignments?: Record<string, string>; persist?: boolean };
const safeTemplate: Record<CarouselSlide["type"], TemplateId> = {
  cover: "cover-minimal",
  content: "content-focus",
  closing: "closing-minimal",
};

function launchOptions() {
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    || process.env.CHROME_PATH
    || ["/snap/bin/chromium", "/usr/bin/chromium", "/usr/bin/google-chrome"].find(existsSync);
  return executablePath ? { executablePath, headless: true as const } : { headless: true as const };
}

export async function renderCarousel({ project: rawProject, baseUrl, workspaceRoot, assetAssignments = {}, persist = true }: ExportOptions) {
  const validatedProject = carouselProjectSchema.parse(rawProject) as CarouselProject;
  const automaticAssignments = assignAssetsToProject(validatedProject, recommendedAssetCatalog);
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
      const attempts = [...new Set([slide.templateId, safeTemplate[slide.type]])];
      let canvas = page.locator("#slide-canvas");
      let issues: OverflowIssue[] = [];
      for (const templateId of attempts) {
        const query = new URLSearchParams();
        if (slide.assetId) query.set("asset", slide.assetId);
        query.set("template", templateId);
        const url = `${baseUrl}/render/${encodeURIComponent(project.id)}/${encodeURIComponent(slide.id)}?${query.toString()}`;
        await page.goto(url, { waitUntil: "networkidle" });
        await page.evaluate(async () => { await document.fonts.ready; });
        const assetsReady = await page.evaluate(() => Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0));
        if (!assetsReady) throw new RenderError("ASSET_NOT_LOADED", `Uno o más assets no cargaron en ${slide.id}.`);
        canvas = page.locator("#slide-canvas");
        if (await canvas.count() !== 1) throw new RenderError("CANVAS_NOT_FOUND", `No se encontró un único canvas en ${slide.id}.`);
        const box = await canvas.boundingBox();
        if (!box || Math.round(box.width) !== SLIDE_WIDTH || Math.round(box.height) !== SLIDE_HEIGHT) throw new RenderError("INVALID_SLIDE_DIMENSIONS", `El canvas DOM de ${slide.id} no mide ${SLIDE_WIDTH}×${SLIDE_HEIGHT}.`);
        issues = await canvas.evaluate((root): OverflowIssue[] => {
          const rootRect = root.getBoundingClientRect();
          const safe = root.querySelector("[data-safe-area]")?.getBoundingClientRect() ?? rootRect;
          const result = Array.from(root.querySelectorAll<HTMLElement>("[data-overflow-check]")).flatMap((element) => {
            const rect = element.getBoundingClientRect();
            const name = element.dataset.overflowCheck || element.tagName.toLowerCase();
            const elementIssues: OverflowIssue[] = [];
            if (element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1) elementIssues.push({ element: name, reason: "content-overflow" });
            if (rect.left < rootRect.left - 1 || rect.top < rootRect.top - 1 || rect.right > rootRect.right + 1 || rect.bottom > rootRect.bottom + 1) elementIssues.push({ element: name, reason: "outside-canvas" });
            if (rect.left < safe.left - 1 || rect.top < safe.top - 1 || rect.right > safe.right + 1 || rect.bottom > safe.bottom + 1) elementIssues.push({ element: name, reason: "outside-safe-area" });
            return elementIssues;
          });
          const collisionElements = Array.from(root.querySelectorAll<HTMLElement>("[data-collision-check]")).filter((element) => {
            const style = getComputedStyle(element);
            return style.display !== "none" && style.visibility !== "hidden";
          });
          for (let left = 0; left < collisionElements.length; left += 1) {
            const leftElement = collisionElements[left]!;
            const leftRect = leftElement.getBoundingClientRect();
            for (let right = left + 1; right < collisionElements.length; right += 1) {
              const rightElement = collisionElements[right]!;
              const rightRect = rightElement.getBoundingClientRect();
              const overlaps = leftRect.left < rightRect.right - 2
                && leftRect.right > rightRect.left + 2
                && leftRect.top < rightRect.bottom - 2
                && leftRect.bottom > rightRect.top + 2;
              if (overlaps) {
                result.push({
                  element: `${leftElement.dataset.collisionCheck}-${rightElement.dataset.collisionCheck}`,
                  reason: "content-overflow",
                });
              }
            }
          }
          return result;
        });
        if (!issues.length) break;
      }
      if (issues.length) throw new RenderError("SLIDE_OVERFLOW", `No fue posible ajustar ${slide.id}: ${issues.map((issue) => `${issue.element}:${issue.reason}`).join(", ")}`);
      const pngPath = path.join(slidesDirectory, `slide-${String(slide.order + 1).padStart(2, "0")}.png`);
      await canvas.screenshot({ path: pngPath, type: "png", animations: "disabled" });
      await validateDimensions(pngPath);
      pngPaths.push(pngPath);
    }
  } finally { await browser.close(); }

  if (!persist) {
    await fs.rm(staging, { recursive: true, force: true });
    return { directory: null, slideCount: pngPaths.length, pdfPath: null, zipPath: null, validated: true };
  }

  const pdfPath = path.join(staging, "carousel.pdf");
  await createPdfFromPngs(pngPaths, pdfPath);

  const exportsRoot = path.join(workspaceRoot, "exports");
  const finalDirectory = path.join(exportsRoot, project.id);
  await fs.mkdir(exportsRoot, { recursive: true });
  await fs.rm(finalDirectory, { recursive: true, force: true });
  await fs.mkdir(finalDirectory, { recursive: true });
  await fs.copyFile(pdfPath, path.join(finalDirectory, "carousel.pdf"));
  await fs.rm(staging, { recursive: true, force: true });
  return {
    directory: finalDirectory,
    slideCount: pngPaths.length,
    pdfPath: path.join(finalDirectory, "carousel.pdf"),
    validated: true,
  };
}
