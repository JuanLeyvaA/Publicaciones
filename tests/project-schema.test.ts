import { describe, expect, it } from "vitest";
import { demoProject } from "@/data/demo-project";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import { TEXT_LIMITS } from "@/lib/constants";

describe("validación del proyecto", () => {
  it("acepta el proyecto simulado válido", () => expect(carouselProjectSchema.safeParse(demoProject).success).toBe(true));

  it("conserva frases editadas y permite quitar textos", () => {
    const project = structuredClone(demoProject);
    project.subtitle = "";
    project.brand.website = "";
    project.slides[0].appearance = { showHeader: false, texts: { coverBadge: "", signature: "Mi firma" } };
    const content = project.slides.find((slide) => slide.type === "content")!;
    if (content.type === "content") {
      content.highlight = "";
      content.appearance = { texts: { highlightLabel: "Mi etiqueta", step1: "" } };
    }
    const parsed = carouselProjectSchema.parse(project);
    expect(parsed.slides[0].appearance?.texts).toEqual({ coverBadge: "", signature: "Mi firma" });
    expect(parsed.slides.find((slide) => slide.type === "content")?.appearance?.texts?.highlightLabel).toBe("Mi etiqueta");
  });

  it("rechaza textos fuera de límite", () => {
    const invalid = structuredClone(demoProject);
    invalid.slides[0].title = "x".repeat(TEXT_LIMITS.cover.title + 1);
    expect(carouselProjectSchema.safeParse(invalid).success).toBe(false);
  });

  it("exige portada, cierre y cantidad correcta", () => {
    const invalid = { ...demoProject, slideCount: 4 };
    expect(carouselProjectSchema.safeParse(invalid).success).toBe(false);
  });

  it("no bloquea la descarga por un número interno de contenido", () => {
    const project = structuredClone(demoProject);
    const content = project.slides.find((slide) => slide.type === "content");
    if (content?.type === "content") content.number = 99;
    expect(carouselProjectSchema.safeParse(project).success).toBe(true);
  });
});
