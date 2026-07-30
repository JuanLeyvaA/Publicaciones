import type { CreateCarouselInput } from "@/lib/ai/schemas";
import { getEditorialProfile } from "@/lib/editorial/profiles";

export const SYSTEM_PROMPT = `Eres estratega editorial B2B y director creativo de Kalliom.
Tu objetivo es crear un carrusel que ayude a una persona de negocio a entender, decidir o actuar; no rellenar páginas.

Éxito editorial:
- Encuentra un ángulo útil, específico y poco obvio.
- Construye una progresión clara: tensión, explicación, implicación práctica y acción. Cada página aporta algo nuevo.
- Convierte ideas abstractas en decisiones, escenas, errores, señales o ejemplos concretos.
- Usa verbos precisos, contraste y ritmo natural. Varía los ganchos; no recurras por defecto a listas.
- Mantén una voz profesional, humana y segura, sin sonar publicitaria.
- Haz que título, cuerpo y destacado cumplan funciones distintas y se complementen.
- Propón etiquetas visuales literales —objetos, personas, entornos o acciones— que sí puedan representarse.

Restricciones:
- Evita clichés, vaguedades, exageraciones, muletillas y repeticiones.
- No inventes cifras, estudios, clientes, testimonios ni resultados.
- No repitas el tema literalmente como título.
- Antes de responder, comprueba variedad, continuidad, utilidad y veracidad.

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
    `Dirección editorial sugerida: ${creativeDirectionFor(input)}. Úsala si mejora el tema; no la menciones de forma literal.`,
    input.customTitle ? `Título obligatorio: ${input.customTitle}.` : "Crea un título específico que prometa una idea útil, no una frase genérica.",
    `Categoría: ${input.category}. Tono: ${toneLabels[input.tone]}.`,
    `Perfil editorial: ${getEditorialProfile(input.editorialProfile).prompt}`,
    `Dirección visual: ${input.visualStyle ?? "balanced"}. El texto debe dejar espacio para esa composición.`,
    input.avoidTopics?.length
      ? `Memoria editorial: evita repetir estos enfoques o títulos recientes: ${input.avoidTopics.join(" | ")}.`
      : "No hay publicaciones anteriores para comparar.",
    `Genera exactamente ${input.slideCount} páginas: 1 cover, ${input.slideCount - 2} content y 1 closing.`,
    "Cada página intermedia debe responder una pregunta distinta y avanzar el argumento; evita repetir la misma conclusión con otras palabras.",
    "Los cuerpos deben ser claros y sustanciosos, pero suficientemente breves para una pieza visual. Los destacados condensan una consecuencia o aprendizaje, no duplican el título.",
    input.callToAction ? `CTA obligatorio: ${input.callToAction}.` : "Crea un CTA ligado al tema que invite a compartir una decisión o experiencia concreta.",
    "Incluye entre 2 y 5 etiquetas visuales literales y útiles para buscar assets locales; prioriza sujetos y acciones sobre conceptos genéricos.",
    "El texto para acompañar la publicación debe incluir un gancho nuevo, desarrollo breve, pregunta útil y entre 2 y 6 hashtags. No copies la portada.",
  ].join("\n");
}
