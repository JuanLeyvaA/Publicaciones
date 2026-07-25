import type { CreateCarouselInput } from "@/lib/ai/schemas";
import { getEditorialProfile } from "@/lib/editorial/profiles";

export const SYSTEM_PROMPT = `Eres estratega editorial B2B y director creativo para LinkedIn.
Encuentra un ángulo útil y poco obvio. Construye una progresión: curiosidad, desarrollo, implicación y acción. Cada página aporta algo nuevo.
Usa verbos concretos, contraste y ritmo. Varía los ganchos entre pregunta, tensión, error, consecuencia, metáfora sobria o transformación; no recurras por defecto a listas.
Evita clichés, vaguedades, exageraciones y repeticiones. No inventes cifras, estudios ni testimonios.
Devuelve solo la estructura solicitada, sin HTML ni Markdown.`;

const toneLabels = {
  educational: "educativo y didáctico",
  direct: "directo y conciso",
  professional: "profesional y cercano",
} as const;

const creativeDirections = [
  "contraste entre la situación actual y una alternativa mejor",
  "un error silencioso y la consecuencia que suele pasar desapercibida",
  "una decisión incómoda que separa intención de resultados",
  "un mito habitual frente a lo que ocurre en la práctica",
  "una escena cotidiana que haga tangible el problema",
  "una cadena clara de causa y efecto",
  "una pregunta provocadora que obligue a replantear el enfoque",
  "un principio contraintuitivo explicado con sencillez",
] as const;

export function creativeDirectionFor(input: Pick<CreateCarouselInput, "topic" | "category">) {
  const value = `${input.topic}:${input.category}`;
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(31, hash) + value.charCodeAt(index) | 0;
  return creativeDirections[Math.abs(hash) % creativeDirections.length];
}

export function buildCarouselPrompt(input: CreateCarouselInput) {
  return [
    `Idioma: ${input.language === "es" ? "español" : "inglés"}.`,
    `Tema: ${input.topic}.`,
    `Dirección editorial sugerida: ${creativeDirectionFor(input)}. Úsala si encaja y evita repetir literalmente el tema como gancho.`,
    input.customTitle ? `Título obligatorio: ${input.customTitle}.` : "Crea un título concreto con brecha de curiosidad.",
    `Categoría: ${input.category}. Tono: ${toneLabels[input.tone]}.`,
    `Perfil editorial: ${getEditorialProfile(input.editorialProfile).prompt}`,
    `Dirección visual: ${input.visualStyle ?? "balanced"}. El texto debe dejar espacio para esa composición.`,
    input.avoidTopics?.length
      ? `Memoria editorial: evita repetir estos enfoques o títulos recientes: ${input.avoidTopics.join(" | ")}.`
      : "No hay publicaciones anteriores para comparar.",
    `Genera exactamente ${input.slideCount} páginas: 1 cover, ${input.slideCount - 2} content y 1 closing.`,
    input.callToAction ? `CTA obligatorio: ${input.callToAction}.` : "Crea un CTA conversacional.",
    "Incluye etiquetas visuales literales y útiles para buscar assets locales.",
    "El copy de LinkedIn debe incluir gancho, desarrollo breve, pregunta y entre 2 y 6 hashtags.",
  ].join("\n");
}
