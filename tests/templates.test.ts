// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildCarouselPrompt, creativeDirectionFor, SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { selectTemplateId, templateCatalog, templatesForType } from "@/lib/templates/catalog";

describe("Sistema de plantillas", () => {
  it("ofrece veintiuna composiciones distintas por cada tipo de página", () => {
    expect(templateCatalog).toHaveLength(63);
    expect(new Set(templateCatalog.map((template) => template.id)).size).toBe(63);
    expect(templatesForType("cover")).toHaveLength(21);
    expect(templatesForType("content")).toHaveLength(21);
    expect(templatesForType("closing")).toHaveLength(21);
  });

  it("asigna plantillas de forma estable y varía páginas de contenido", () => {
    const ids = [1, 2, 3, 4, 5].map((order) => selectTemplateId("content", "project-demo", order));
    expect(ids).toEqual([1, 2, 3, 4, 5].map((order) => selectTemplateId("content", "project-demo", order)));
    expect(new Set(ids).size).toBe(5);
  });
});

describe("Dirección creativa", () => {
  const input = {
    topic: "automatización para equipos comerciales",
    category: "automation" as const,
    language: "es" as const,
    tone: "professional" as const,
    slideCount: 5,
  };

  it("elige una dirección reproducible y la incorpora al prompt", () => {
    const direction = creativeDirectionFor(input);
    expect(creativeDirectionFor(input)).toBe(direction);
    expect(buildCarouselPrompt(input)).toContain(`Dirección editorial sugerida: ${direction}`);
  });

  it("pide variedad narrativa sin relajar las reglas de veracidad", () => {
    expect(SYSTEM_PROMPT).toContain("no recurras por defecto a listas");
    expect(SYSTEM_PROMPT).toContain("No inventes cifras");
    expect(SYSTEM_PROMPT).toContain("Cada página aporta algo nuevo");
  });
});
