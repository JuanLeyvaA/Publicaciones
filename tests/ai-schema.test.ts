import { describe, expect, it } from "vitest";
import { aiCarouselSchema, createCarouselInputSchema, validateOutputForInput } from "@/lib/ai/schemas";

describe("schemas de IA", () => {
  it("limita entradas a 3–10 páginas", () => {
    const base = { topic: "Tema válido", category: "automation", language: "es", tone: "professional" };
    expect(createCarouselInputSchema.safeParse({ ...base, slideCount: 3 }).success).toBe(true);
    expect(createCarouselInputSchema.safeParse({ ...base, slideCount: 11 }).success).toBe(false);
  });

  it("rechaza HTML y estructuras incompletas", () => {
    const result = aiCarouselSchema.safeParse({
      title: "<b>Título</b>",
      subtitle: "Subtítulo",
      category: "automation",
      slides: [],
      linkedin: {},
    });
    expect(result.success).toBe(false);
  });

  it("no acepta una cantidad distinta sin pedir otra generación", () => {
    const input = createCarouselInputSchema.parse({ topic: "Tema válido", slideCount: 4, category: "automation", language: "es", tone: "professional" });
    const output = aiCarouselSchema.parse({
      title: "Título",
      subtitle: "Subtítulo",
      category: "automation",
      slides: [
        { type: "cover", title: "Título", subtitle: "Subtítulo", visualTags: ["automation"] },
        { type: "content", number: 1, title: "Idea", body: "Contenido útil.", highlight: "Destacado.", visualTags: ["workflow"] },
        { type: "closing", title: "Cierre", body: "Mensaje final.", cta: "Conversemos.", visualTags: ["business"] },
      ],
      linkedin: { hook: "Gancho.", body: "Cuerpo.", question: "¿Pregunta?", hashtags: ["#Uno", "#Dos"] },
    });
    expect(() => validateOutputForInput(input, output)).toThrow(/esperaban 4/);
  });
});
