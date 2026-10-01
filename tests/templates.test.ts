// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildCarouselPrompt, creativeBriefFor, creativeDirectionFor, SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { artDirectionCopy, artDirectionForCover, artDirectionIds } from "@/lib/templates/artDirection";
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
    expect(SYSTEM_PROMPT).toContain("hilo conductor visible");
  });

  it("combina voces, ritmos, aperturas y mundos visuales en lugar de una sola fórmula", () => {
    const briefs = Array.from({ length: 30 }, (_, index) => creativeBriefFor({
      ...input,
      topic: `Problema empresarial específico número ${index}`,
      slideCount: 5 + index % 3,
    }));
    expect(new Set(briefs.map((brief) => brief.narrative)).size).toBeGreaterThanOrEqual(8);
    expect(new Set(briefs.map((brief) => brief.voice)).size).toBeGreaterThanOrEqual(7);
    expect(new Set(briefs.map((brief) => brief.visualWorld)).size).toBeGreaterThanOrEqual(7);
    expect(buildCarouselPrompt(input)).toContain("Huella creativa de esta publicación");
    expect(buildCarouselPrompt(input)).toContain("etiquetas simples en inglés");
  });

  it("trata el guion como fuente de verdad para cada página sin exigir numeración", () => {
    const prompt = buildCarouselPrompt({
      ...input,
      manualBrief: "1. Portada: pregunta concreta. 2. Contexto: explica la fricción. 3. Cierre: pide una decisión.",
    });
    expect(prompt).toContain("Regla de prioridad: el guion es la fuente de verdad de cada página");
    expect(prompt).toContain("La persona usuaria no tiene que numerarlos");
    expect(prompt).toContain("GUION AUTORITATIVO POR PÁGINA");
    expect(prompt).toContain("No recuperes contenido de solicitudes anteriores");
  });

  it("convierte las portadas en doce identidades visuales completas", () => {
    const directions = templatesForType("cover").map((template) => artDirectionForCover(template.id));
    expect(new Set(directions)).toEqual(new Set(artDirectionIds));
    expect(new Set(Object.values(artDirectionCopy).map((direction) => direction.coverKicker)).size).toBe(12);
    expect(new Set(Object.values(artDirectionCopy).map((direction) => direction.ctaLabel)).size).toBe(12);
  });
});
