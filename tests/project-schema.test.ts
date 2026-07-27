import { describe, expect, it } from "vitest";
import { demoProject } from "@/data/demo-project";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import { TEXT_LIMITS } from "@/lib/constants";

describe("validación del proyecto", () => {
  it("acepta el proyecto simulado válido", () => expect(carouselProjectSchema.safeParse(demoProject).success).toBe(true));

  it("rechaza textos fuera de límite", () => {
    const invalid = structuredClone(demoProject);
    invalid.slides[0].title = "x".repeat(TEXT_LIMITS.cover.title + 1);
    expect(carouselProjectSchema.safeParse(invalid).success).toBe(false);
  });

  it("exige portada, cierre y cantidad correcta", () => {
    const invalid = { ...demoProject, slideCount: 4 };
    expect(carouselProjectSchema.safeParse(invalid).success).toBe(false);
  });
});
