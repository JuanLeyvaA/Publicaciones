import type { CreateCarouselInput } from "@/lib/ai/schemas";
import { getEditorialProfile } from "@/lib/editorial/profiles";

export const SYSTEM_PROMPT = `Rol: eres estratega editorial B2B y director creativo de Kalliom.

Personalidad: escribes como una persona observadora que ha trabajado con empresas reales. Tu voz es cercana, lúcida y segura; puede ser incisiva o cálida, pero nunca corporativa, robótica ni promocional.

Objetivo: convertir un tema en un carrusel que ayude a entender, decidir o actuar y que se sienta escrito desde una mirada propia.

Éxito significa:
- Encontrar un ángulo específico y poco obvio, con una observación humana o una situación reconocible.
- Construir una progresión donde Cada página aporta algo nuevo y cumple una función distinta.
- Alternar escenas, preguntas, contrastes, explicaciones, ejemplos, objeciones y decisiones; no recurras por defecto a listas.
- Variar sintaxis, longitud y cadencia. Combina frases breves con otras más conversacionales y deja respirar las ideas.
- Hacer que título, cuerpo y destacado se complementen sin parafrasearse.
- Proponer sujetos, objetos, acciones y entornos que puedan convertirse en imágenes concretas.

Evita:
- La fórmula repetida “X no es Y: es Z”, títulos que empiezan siempre con “La…” o “El…”, y varias páginas con la misma construcción gramatical.
- Clichés, moralejas obvias, grandilocuencia, muletillas, definiciones de diccionario y frases que podrían pertenecer a cualquier empresa.
- Inventar cifras, estudios, clientes, testimonios o resultados. No inventes cifras ni autoridad para hacer más fuerte el texto.
- Repetir literalmente el tema, el gancho de portada o una conclusión ya usada.

Antes de responder, comprueba variedad de aperturas, continuidad, utilidad, naturalidad y veracidad. Devuelve solo la estructura solicitada, sin HTML ni Markdown.`;

const toneLabels = {
  educational: "educativo, claro y curioso",
  direct: "directo, franco y con ritmo",
  professional: "profesional, cercano y nada acartonado",
} as const;

const narrativeDirections = [
  "abrir con una escena cotidiana y revelar la decisión escondida detrás",
  "seguir la anatomía de un error desde la primera señal hasta su coste operativo",
  "contrastar dos equipos que afrontan el mismo problema con criterios distintos",
  "convertir el tema en un diagnóstico con señales observables y una salida práctica",
  "partir de una creencia razonable, tensionarla y sustituirla por una idea más útil",
  "narrar una pequeña cadena de causa y efecto que normalmente pasa desapercibida",
  "mostrar el antes, el momento de quiebre y el después sin prometer resultados mágicos",
  "examinar una decisión incómoda desde sus consecuencias reales",
  "usar una pregunta genuina como hilo y responderla por capas, no de una vez",
  "presentar notas de campo: observación, patrón, explicación y criterio de acción",
  "desmontar una falsa elección y proponer un tercer camino más concreto",
  "explicar el tema mediante una metáfora visual consistente y aterrizarla al negocio",
] as const;

const voices = [
  "un operador experimentado que habla con franqueza y sin presumir",
  "una estratega curiosa que observa detalles antes de concluir",
  "un colega que comparte algo que aprendió tarde y habría querido saber antes",
  "una editora que elimina ruido y deja una idea precisa en cada página",
  "un mentor práctico que plantea preguntas mejores en vez de dar sermones",
  "una voz contraria con argumentos serenos, no provocación vacía",
  "un diario de campo sobrio, atento a señales y pequeñas fricciones",
  "una conversación entre pares con humor seco muy ocasional",
  "un analista que vuelve tangible lo abstracto con escenas y objetos",
  "una voz ejecutiva que reconoce matices y evita soluciones universales",
] as const;

const rhythms = [
  "apertura muy breve, desarrollo conversacional y cierre seco",
  "frases medianas con una pausa breve que cambie el sentido",
  "pregunta, observación, respuesta parcial y consecuencia",
  "ritmo ascendente: cada página añade tensión antes de resolver",
  "cadencia de memo: hechos concretos, interpretación y decisión",
  "alternancia entre una línea contundente y una explicación cálida",
  "ritmo pausado, con espacio para una imagen mental en cada página",
  "comienzo narrativo y páginas finales cada vez más precisas",
] as const;

const openingDevices = [
  "un gesto pequeño que delate un problema grande",
  "una frase que alguien diría en una reunión real",
  "una contradicción visible entre intención y comportamiento",
  "un objeto cotidiano usado como prueba del problema",
  "una pregunta que no admita una respuesta automática",
  "el momento exacto en que una tarea vuelve a empezar",
  "una señal que suele interpretarse al revés",
  "una decisión aparentemente sensata que crea trabajo después",
  "una comparación inesperada pero fácil de visualizar",
  "una observación incómoda expresada sin dramatismo",
] as const;

const visualWorlds = [
  "personas trabajando, gestos reales y espacios vividos",
  "máquinas táctiles, palancas, piezas y flujos físicos",
  "formas orgánicas, jardines de datos y crecimiento no lineal",
  "robots con tareas concretas y expresiones sutiles",
  "arquitectura, puertas, escaleras y cambios de escala",
  "papel, notas, herramientas y evidencia sobre una mesa",
  "señales, mapas, rutas y puntos de decisión",
  "sistemas transparentes que muestran cómo circula algo",
  "escenas industriales con colaboración humana",
  "objetos aislados usados como metáforas editoriales",
] as const;

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  return hash >>> 0;
}

function pick<T>(items: readonly T[], seed: number, offset: number) {
  return items[((seed + Math.imul(offset + 1, 2654435761)) >>> 0) % items.length]!;
}

export function creativeBriefFor(input: Pick<CreateCarouselInput, "topic" | "category" | "slideCount" | "avoidTopics">) {
  const memory = input.avoidTopics?.slice(0, 4).join("|") ?? "";
  const seed = stableHash(`${input.topic}:${input.category}:${input.slideCount}:${memory}`);
  return {
    narrative: pick(narrativeDirections, seed, 0),
    voice: pick(voices, seed, 1),
    rhythm: pick(rhythms, seed, 2),
    opening: pick(openingDevices, seed, 3),
    visualWorld: pick(visualWorlds, seed, 4),
  };
}

export function creativeDirectionFor(input: Pick<CreateCarouselInput, "topic" | "category">) {
  return creativeBriefFor({ ...input, slideCount: 5 }).narrative;
}

export function buildCarouselPrompt(input: CreateCarouselInput) {
  const brief = creativeBriefFor(input);
  return [
    `Idioma: ${input.language === "es" ? "español natural" : "natural English"}. Tema: ${input.topic}.`,
    `Resultado: exactamente ${input.slideCount} páginas — 1 cover, ${input.slideCount - 2} content y 1 closing — más el texto de LinkedIn.`,
    `Dirección editorial sugerida: ${brief.narrative}. Úsala como brújula, no como frase literal.`,
    "Huella creativa de esta publicación:",
    `- Voz: ${brief.voice}.`,
    `- Ritmo: ${brief.rhythm}.`,
    `- Apertura: ${brief.opening}.`,
    `- Mundo visual: ${brief.visualWorld}.`,
    input.customTitle ? `Conserva exactamente este título: ${input.customTitle}.` : "Crea una portada específica, inesperada y fácil de decir en voz alta.",
    `Categoría: ${input.category}. Tono: ${toneLabels[input.tone]}.`,
    `Perfil: ${getEditorialProfile(input.editorialProfile).prompt}`,
    `Dirección visual: ${input.visualStyle ?? "balanced"}; escribe con suficiente aire para la composición.`,
    input.avoidTopics?.length
      ? `Memoria editorial: aléjate de los enfoques, aperturas y títulos recientes siguientes: ${input.avoidTopics.join(" | ")}.`
      : "No hay publicaciones anteriores para comparar.",
    "Cada página intermedia debe tener un papel distinto en el argumento. No uses la misma estructura sintáctica en dos títulos consecutivos.",
    "Los cuerpos deben sonar hablados y precisos, con al menos un detalle reconocible cuando sea pertinente. Los destacados expresan una consecuencia, criterio o pregunta nueva.",
    input.callToAction ? `CTA obligatorio: ${input.callToAction}.` : "Cierra con una invitación concreta a compartir una experiencia, decisión o desacuerdo; evita “¿qué opinas?” y “hablemos” sin contexto.",
    "Para visualTags usa entre 3 y 6 etiquetas simples en inglés y minúsculas. Incluye sujeto, acción, objeto o entorno; evita etiquetas abstractas como innovation o success cuando exista una imagen más concreta.",
    "El texto de LinkedIn debe poder leerse como una publicación independiente: gancho distinto a la portada, desarrollo con cadencia humana, pregunta específica y 2–6 hashtags. No resumas página por página.",
    "Comprobación final: ninguna afirmación inventada, ninguna idea duplicada y ninguna fórmula de título repetida.",
  ].join("\n");
}
