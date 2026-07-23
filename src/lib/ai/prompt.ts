import type { CreateCarouselInput } from "@/lib/ai/schemas";

export const SYSTEM_PROMPT = `Eres estratega editorial B2B. Crea carruseles claros, útiles y específicos.
Devuelve solo la estructura solicitada. No inventes cifras, estudios ni testimonios.
Una idea por página. Evita clichés, exageraciones, HTML y Markdown.`;

const toneLabels = {
  educational: "educativo y didáctico",
  direct: "directo y conciso",
  professional: "profesional y cercano",
} as const;

export function buildCarouselPrompt(input: CreateCarouselInput) {
  return [
    `Idioma: ${input.language === "es" ? "español" : "inglés"}.`,
    `Tema: ${input.topic}.`,
    input.customTitle ? `Título obligatorio: ${input.customTitle}.` : "Crea un título concreto con brecha de curiosidad.",
    `Categoría: ${input.category}. Tono: ${toneLabels[input.tone]}.`,
    `Genera exactamente ${input.slideCount} páginas: 1 cover, ${input.slideCount - 2} content y 1 closing.`,
    input.callToAction ? `CTA obligatorio: ${input.callToAction}.` : "Crea un CTA conversacional.",
    "Incluye etiquetas visuales literales y útiles para buscar assets locales.",
    "El copy de LinkedIn debe incluir gancho, desarrollo breve, pregunta y entre 2 y 6 hashtags.",
  ].join("\n");
}
