// @vitest-environment node
import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { batchSchema } from "@/app/api/projects/batch/route";
import { demoProject } from "@/data/demo-project";
import { editorialProfiles } from "@/lib/editorial/profiles";
import { reviewProject } from "@/lib/quality/reviewProject";
import { isTemplateCompatible } from "@/lib/templates/catalog";
import { applyVisualStyle } from "@/lib/templates/visualStyle";

describe("Fase 5", () => {
  it("acepta lotes de hasta 20 publicaciones", () => {
    const base = {
      slideCount: 5,
      category: "automation",
      language: "es",
      tone: "professional",
      editorialProfile: "educator",
      visualStyle: "bold",
    };
    expect(batchSchema.safeParse({ ...base, topics: Array.from({ length: 20 }, (_, index) => `Tema válido ${index}`) }).success).toBe(true);
    expect(batchSchema.safeParse({ ...base, topics: Array.from({ length: 21 }, (_, index) => `Tema válido ${index}`) }).success).toBe(false);
  });

  it("acepta ajustes y fechas independientes dentro del mismo lote", () => {
    const result = batchSchema.safeParse({
      items: [
        { topic: "Tema uno", slideCount: 3, category: "automation", language: "es", tone: "direct", editorialProfile: "opinion", visualStyle: "bold" },
        { topic: "Tema dos", slideCount: 10, category: "analytics", language: "en", tone: "educational", editorialProfile: "educator", visualStyle: "minimal", scheduledAt: "2026-08-10T14:00:00.000Z" },
      ],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.items[0]?.slideCount).toBe(3);
      expect(result.data.items[1]?.slideCount).toBe(10);
      expect(result.data.items[0]?.visualStyle).not.toBe(result.data.items[1]?.visualStyle);
    }
  });

  it("incluye cinco perfiles editoriales reutilizables", () => {
    expect(editorialProfiles).toHaveLength(5);
    expect(new Set(editorialProfiles.map((profile) => profile.id)).size).toBe(5);
  });

  it("aplica direcciones visuales conservando compatibilidad", () => {
    for (const style of ["balanced", "minimal", "bold", "image-led", "text-led"] as const) {
      const project = applyVisualStyle(demoProject, style);
      expect(project.visualStyle).toBe(style);
      expect(project.slides.every((slide) => isTemplateCompatible(slide.type, slide.templateId))).toBe(true);
    }
  });

  it("detecta repetición interna e histórica sin usar IA", () => {
    const duplicate = {
      ...demoProject,
      slides: demoProject.slides.map((slide, index) => index === 1 ? { ...slide, title: demoProject.slides[0]!.title } : slide),
    };
    const report = reviewProject(duplicate, [demoProject.title]);
    expect(report.score).toBeLessThan(100);
    expect(report.issues.map((issue) => issue.code)).toContain("SIMILAR_TO_HISTORY");
  });

  it("deja la exportación persistida únicamente en PDF", async () => {
    const rendering = await fs.readFile(path.resolve("src/lib/rendering/renderSlides.ts"), "utf8");
    const route = await fs.readFile(path.resolve("src/app/api/projects/[projectId]/export/route.ts"), "utf8");
    expect(rendering).not.toMatch(/createZipFromDirectory|linkedin-copy|carousel-data/);
    expect(route).toContain('format !== "pdf"');
  });

  it("expone regeneración parcial independiente del generador completo", async () => {
    const route = await fs.readFile(path.resolve("src/app/api/projects/[projectId]/regenerate/route.ts"), "utf8");
    expect(route).toMatch(/title|slide|cta|linkedin/);
    expect(route).toMatch(/regenerateProjectPart/);
    expect(route).not.toMatch(/getOrGenerateCarousel/);
  });
});
