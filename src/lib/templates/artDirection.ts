import type { SlideAppearance, TemplateId } from "@/types/carousel";

export function editableDirectionCopy(direction: ArtDirectionId, appearance?: SlideAppearance): ArtDirectionCopy {
  const defaults = artDirectionCopy[direction];
  const { step1, step2, step3, series: _series, ...texts } = appearance?.texts ?? {};
  return { ...defaults, ...texts, visualSteps: [step1 ?? defaults.visualSteps[0], step2 ?? defaults.visualSteps[1], step3 ?? defaults.visualSteps[2]] };
}

export const artDirectionIds = [
  "billboard",
  "editorial",
  "photo-essay",
  "field-notes",
  "conversation",
  "product-ui",
  "data-story",
  "diagram",
  "collage",
  "manifesto",
  "cinematic",
  "playful",
] as const;

export type ArtDirectionId = (typeof artDirectionIds)[number];

export type ArtDirectionCopy = {
  coverKicker: string;
  coverBadge: string;
  displayWord: string;
  contentKicker: string;
  highlightLabel: string;
  visualCaption: string;
  visualSteps: readonly [string, string, string];
  closingKicker: string;
  ctaLabel: string;
  signature: string;
};

export const artDirectionCopy: Record<ArtDirectionId, ArtDirectionCopy> = {
  billboard: {
    coverKicker: "Una postura Kalliom",
    coverBadge: "Para detener el scroll",
    displayWord: "AHORA",
    contentKicker: "La idea, sin rodeos",
    highlightLabel: "Qué conviene recordar",
    visualCaption: "Una idea. Una decisión.",
    visualSteps: ["Señal", "Tensión", "Decisión"],
    closingKicker: "Que quede una idea",
    ctaLabel: "Llévalo a la conversación",
    signature: "CLARO / DIRECTO / ÚTIL",
  },
  editorial: {
    coverKicker: "Kalliom · Perspectivas",
    coverBadge: "Lectura breve",
    displayWord: "EDICIÓN",
    contentKicker: "Nota editorial",
    highlightLabel: "Al margen",
    visualCaption: "Criterio para decidir mejor",
    visualSteps: ["Contexto", "Lectura", "Criterio"],
    closingKicker: "Fin de la nota",
    ctaLabel: "La pregunta queda abierta",
    signature: "KALLIOM / PERSPECTIVAS",
  },
  "photo-essay": {
    coverKicker: "Una escena de trabajo real",
    coverBadge: "Historia visual",
    displayWord: "EN FOCO",
    contentKicker: "Lo que muestra la escena",
    highlightLabel: "Fuera de cuadro",
    visualCaption: "Mira primero. Decide después.",
    visualSteps: ["Escena", "Detalle", "Lectura"],
    closingKicker: "Después de mirar",
    ctaLabel: "Cuéntanos tu escena",
    signature: "OBSERVAR / ENTENDER / ACTUAR",
  },
  "field-notes": {
    coverKicker: "Notas desde la operación",
    coverBadge: "Hallazgo de campo",
    displayWord: "NOTA 01",
    contentKicker: "Apunte de trabajo",
    highlightLabel: "Subrayado",
    visualCaption: "Evidencia antes que intuición",
    visualSteps: ["Observar", "Anotar", "Probar"],
    closingKicker: "Cierre de libreta",
    ctaLabel: "Ponlo a prueba",
    signature: "NOTAS DE CAMPO / KALLIOM",
  },
  conversation: {
    coverKicker: "Una conversación pendiente",
    coverBadge: "Abramos el tema",
    displayWord: "HABLEMOS",
    contentKicker: "Entre colegas",
    highlightLabel: "La respuesta corta",
    visualCaption: "Preguntar también es avanzar",
    visualSteps: ["Pregunta", "Matiz", "Respuesta"],
    closingKicker: "Tu turno",
    ctaLabel: "Sigue la conversación",
    signature: "LEEMOS / RESPONDEMOS / APRENDEMOS",
  },
  "product-ui": {
    coverKicker: "Sistema Kalliom · En vivo",
    coverBadge: "Vista operativa",
    displayWord: "ONLINE",
    contentKicker: "Dentro del sistema",
    highlightLabel: "Salida esperada",
    visualCaption: "Menos fricción. Más claridad.",
    visualSteps: ["Entrada", "Proceso", "Salida"],
    closingKicker: "Proceso completado",
    ctaLabel: "Activa el siguiente paso",
    signature: "SYSTEM / READY",
  },
  "data-story": {
    coverKicker: "Una señal que merece atención",
    coverBadge: "Lectura de señales",
    displayWord: "SEÑAL",
    contentKicker: "Lo que dicen los patrones",
    highlightLabel: "Lectura clave",
    visualCaption: "Los datos orientan; el criterio decide",
    visualSteps: ["Dato", "Patrón", "Acción"],
    closingKicker: "La lectura útil",
    ctaLabel: "Compara esta señal con la tuya",
    signature: "SIGNAL / SENSE / ACTION",
  },
  diagram: {
    coverKicker: "Mapa para una decisión",
    coverBadge: "Sistema explicado",
    displayWord: "MAPA",
    contentKicker: "Pieza del sistema",
    highlightLabel: "Punto de conexión",
    visualCaption: "Las relaciones cambian el resultado",
    visualSteps: ["Origen", "Conexión", "Destino"],
    closingKicker: "Mapa completo",
    ctaLabel: "Traza tu siguiente movimiento",
    signature: "ORIGEN → CONEXIÓN → ACCIÓN",
  },
  collage: {
    coverKicker: "Ideas que no caben en una caja",
    coverBadge: "Composición abierta",
    displayWord: "MEZCLA",
    contentKicker: "Una pieza del conjunto",
    highlightLabel: "Recorte importante",
    visualCaption: "Conectar también es crear",
    visualSteps: ["Recorte", "Cruce", "Nueva idea"],
    closingKicker: "La imagen completa",
    ctaLabel: "Añade tu pieza",
    signature: "IDEAS / CAPAS / CONEXIONES",
  },
  manifesto: {
    coverKicker: "Una idea para tomar posición",
    coverBadge: "Manifiesto breve",
    displayWord: "CREEMOS",
    contentKicker: "Una convicción práctica",
    highlightLabel: "En una frase",
    visualCaption: "La claridad también toma partido",
    visualSteps: ["Creencia", "Elección", "Práctica"],
    closingKicker: "Nuestra posición",
    ctaLabel: "¿Dónde te plantas tú?",
    signature: "MENOS RUIDO / MÁS CRITERIO",
  },
  cinematic: {
    coverKicker: "Kalliom presenta",
    coverBadge: "Historia en progreso",
    displayWord: "ESCENA 01",
    contentKicker: "La escena cambia",
    highlightLabel: "El giro",
    visualCaption: "Cada decisión mueve la historia",
    visualSteps: ["Escena", "Giro", "Consecuencia"],
    closingKicker: "Última escena",
    ctaLabel: "Continúa la historia",
    signature: "A KALLIOM STORY",
  },
  playful: {
    coverKicker: "Una idea para mover de sitio",
    coverBadge: "Pruébala así",
    displayWord: "¡VAMOS!",
    contentKicker: "Cambio de perspectiva",
    highlightLabel: "La chispa",
    visualCaption: "Curiosidad en movimiento",
    visualSteps: ["Jugar", "Descubrir", "Aplicar"],
    closingKicker: "Una última vuelta",
    ctaLabel: "Llévate esta idea",
    signature: "CURIOSIDAD / MOVIMIENTO / CAMBIO",
  },
};

const coverDirections: Partial<Record<TemplateId, ArtDirectionId>> = {
  cover: "field-notes",
  "cover-split": "photo-essay",
  "cover-poster": "billboard",
  "cover-minimal": "manifesto",
  "cover-frame": "conversation",
  "cover-sidebar": "photo-essay",
  "cover-stack": "editorial",
  "cover-diagonal": "billboard",
  "cover-grid": "data-story",
  "cover-spotlight": "cinematic",
  "cover-terminal": "product-ui",
  "cover-bento": "playful",
  "cover-ribbon": "billboard",
  "cover-portal": "cinematic",
  "cover-editorial": "editorial",
  "cover-wave": "playful",
  "cover-typographic": "manifesto",
  "cover-collage": "collage",
  "cover-arch": "photo-essay",
  "cover-radar": "diagram",
  "cover-staircase": "diagram",
};

export function artDirectionForCover(templateId: TemplateId): ArtDirectionId {
  return coverDirections[templateId] ?? "editorial";
}

export function artDirectionClass(direction: ArtDirectionId) {
  return `art-direction-${direction}`;
}
