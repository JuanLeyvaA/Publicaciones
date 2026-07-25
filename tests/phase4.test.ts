// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { demoProject } from "@/data/demo-project";
import { createZipFromDirectory } from "@/lib/rendering/createZip";
import { carouselProjectSchema } from "@/lib/validation/project-schema";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true })));
});

describe("Fase 4", () => {
  it("acepta plantillas alternativas compatibles", () => {
    const project = {
      ...demoProject,
      slides: demoProject.slides.map((slide) => ({
        ...slide,
        templateId: slide.type === "cover"
          ? "cover-split"
          : slide.type === "content"
            ? "content-focus"
            : "closing-minimal",
      })),
    };
    expect(carouselProjectSchema.safeParse(project).success).toBe(true);
  });

  it("rechaza plantillas incompatibles", () => {
    const project = {
      ...demoProject,
      slides: demoProject.slides.map((slide, index) => index === 1 ? { ...slide, templateId: "cover-split" } : slide),
    };
    expect(carouselProjectSchema.safeParse(project).success).toBe(false);
  });

  it("crea un ZIP final con archivos y carpetas", async () => {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), "kalliom-phase4-"));
    directories.push(directory);
    await fs.mkdir(path.join(directory, "slides"));
    await fs.writeFile(path.join(directory, "carousel.pdf"), "pdf");
    await fs.writeFile(path.join(directory, "slides", "slide-01.png"), "png");
    const output = path.join(directory, "package.zip");

    const result = await createZipFromDirectory(directory, output);
    const zip = await fs.readFile(output);

    expect(result.fileCount).toBe(2);
    expect(zip.readUInt32LE(0)).toBe(0x04034b50);
    expect(zip.includes(Buffer.from("carousel.pdf"))).toBe(true);
    expect(zip.includes(Buffer.from("slides/slide-01.png"))).toBe(true);
    expect(zip.readUInt32LE(zip.length - 22)).toBe(0x06054b50);
  });

  it("mantiene edición, validación y exportación fuera del motor de IA", async () => {
    const sources = await Promise.all([
      fs.readFile(path.resolve("src/app/api/projects/[projectId]/route.ts"), "utf8"),
      fs.readFile(path.resolve("src/app/api/projects/[projectId]/validate/route.ts"), "utf8"),
      fs.readFile(path.resolve("src/app/api/projects/[projectId]/export/route.ts"), "utf8"),
    ]);
    for (const source of sources) expect(source).not.toMatch(/OpenAI|getOrGenerateCarousel|generateCarousel/);
  });
});
