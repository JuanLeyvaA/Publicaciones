import { describe, expect, it } from "vitest";
import { demoProject } from "@/data/demo-project";
import { carouselProjectSchema } from "@/lib/validation/project-schema";

describe("validación del proyecto", () => {
  it("acepta el proyecto simulado válido", () => expect(carouselProjectSchema.safeParse(demoProject).success).toBe(true));

  it("rechaza textos fuera de límite", () => {
    const invalid = structuredClone(demoProject);
    invalid.slides[0].title = "x".repeat(71);
    expect(carouselProjectSchema.safeParse(invalid).success).toBe(false);
  });

  it("exige portada, cierre y cantidad correcta", () => {
    const invalid = { ...demoProject, slideCount: 4 };
    expect(carouselProjectSchema.safeParse(invalid).success).toBe(false);
  });
});
