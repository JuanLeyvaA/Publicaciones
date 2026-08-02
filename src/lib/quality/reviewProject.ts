import type { CarouselProject, QualityIssue, QualityReport } from "@/types/carousel";

const clichés = [
  "llevar al siguiente nivel",
  "en un mundo cada vez más",
  "la clave del éxito",
  "revolucionar",
  "game changer",
  "sin límites",
  "transforma tu negocio",
  "el futuro es ahora",
  "marcar la diferencia",
  "desbloquear el potencial",
  "potenciar tu empresa",
  "solución innovadora",
  "quedarse atrás",
  "más que nunca",
  "ya no es una opción",
  "en la era digital",
  "dar el siguiente paso",
  "puede marcar la diferencia",
];

const vaguePhrases = [
  "mejorar la eficiencia",
  "optimizar procesos",
  "generar valor",
  "impulsar el crecimiento",
  "tomar mejores decisiones",
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function words(value: string) {
  return new Set(normalize(value).split(" ").filter((word) => word.length > 3));
}

function titleShape(value: string) {
  const normalized = normalize(value);
  if (value.trim().startsWith("¿")) return "question";
  if (/\bno es\b.+\bes\b/.test(normalized) || /\bno se trata de\b/.test(normalized)) return "negation-contrast";
  if (value.includes(":")) return "colon";
  if (/^(el|la|los|las|un|una)\b/.test(normalized)) return "article";
  if (/^\d+\b/.test(normalized)) return "number";
  return "statement";
}

export function textSimilarity(left: string, right: string) {
  const a = words(left);
  const b = words(right);
  if (!a.size || !b.size) return 0;
  const shared = [...a].filter((word) => b.has(word)).length;
  return shared / new Set([...a, ...b]).size;
}

export function reviewProject(project: CarouselProject, previousTitles: string[] = []): QualityReport {
  const issues: QualityIssue[] = [];
  const seenTitles = new Map<string, string>();
  const seenOpenings = new Map<string, string>();
  const allText = project.slides.map((slide) => {
    const extra = slide.type === "cover" ? slide.subtitle : slide.type === "content" ? `${slide.body} ${slide.highlight}` : `${slide.body} ${slide.cta}`;
    return `${slide.title} ${extra}`;
  }).join(" ");

  for (const slide of project.slides) {
    const normalizedTitle = normalize(slide.title);
    if (seenTitles.has(normalizedTitle)) issues.push({ code: "DUPLICATE_SLIDE_TITLE", severity: "error", message: "Hay títulos repetidos dentro del carrusel.", slideId: slide.id });
    seenTitles.set(normalizedTitle, slide.id);
    const opening = normalizedTitle.split(" ").slice(0, 2).join(" ");
    if (opening.split(" ").length === 2 && seenOpenings.has(opening)) {
      issues.push({ code: "REPEATED_TITLE_OPENING", severity: "warning", message: "Dos títulos comienzan de la misma forma; conviene variar el ritmo.", slideId: slide.id });
    }
    seenOpenings.set(opening, slide.id);
    if (textSimilarity(slide.title, project.topic) > 0.8) issues.push({ code: "TOPIC_AS_TITLE", severity: "warning", message: "El título repite demasiado literalmente el tema.", slideId: slide.id });
    if (normalizedTitle.split(" ").length < 3) issues.push({ code: "THIN_TITLE", severity: "info", message: "Este título puede ser más específico.", slideId: slide.id });
    if (slide.type === "content") {
      if (normalize(slide.body).split(" ").length < 12) issues.push({ code: "THIN_BODY", severity: "warning", message: "Esta página necesita una idea un poco más desarrollada.", slideId: slide.id });
      if (textSimilarity(slide.title, slide.highlight) >= 0.68) issues.push({ code: "DUPLICATE_HIGHLIGHT", severity: "warning", message: "El destacado repite el título en lugar de aportar una consecuencia.", slideId: slide.id });
    }
  }

  const contentSlides = project.slides.filter((slide) => slide.type === "content");
  for (let left = 0; left < contentSlides.length; left += 1) {
    for (let right = left + 1; right < contentSlides.length; right += 1) {
      if (textSimilarity(contentSlides[left]!.body, contentSlides[right]!.body) >= 0.58) {
        issues.push({ code: "REPEATED_ARGUMENT", severity: "error", message: "Dos páginas desarrollan prácticamente el mismo argumento.", slideId: contentSlides[right]!.id });
      }
    }
  }

  const shapes = new Map<string, number>();
  project.slides.forEach((slide) => shapes.set(titleShape(slide.title), (shapes.get(titleShape(slide.title)) ?? 0) + 1));
  const dominantShape = [...shapes.entries()].sort((left, right) => right[1] - left[1])[0];
  if (dominantShape && dominantShape[1] >= Math.max(3, Math.ceil(project.slides.length * 0.6))) {
    issues.push({ code: "FORMULAIC_TITLE_RHYTHM", severity: "warning", message: "Demasiados títulos comparten la misma construcción; cambia preguntas, afirmaciones, escenas y contrastes." });
  }

  for (const cliché of clichés) {
    if (normalize(allText).includes(normalize(cliché))) issues.push({ code: "CLICHE", severity: "warning", message: `Evita el cliché “${cliché}”.` });
  }
  for (const phrase of vaguePhrases) {
    if (normalize(allText).includes(normalize(phrase))) issues.push({ code: "VAGUE_CLAIM", severity: "info", message: `Aterriza “${phrase}” con una decisión, señal o ejemplo.` });
  }

  if (new Set(project.slides.map((slide) => slide.templateId)).size < Math.min(3, project.slides.length)) {
    issues.push({ code: "LOW_LAYOUT_VARIETY", severity: "warning", message: "Hay poca variedad de composición entre páginas." });
  }
  const assetIds = project.slides.flatMap((slide) => slide.assetId ? [slide.assetId] : []);
  if (new Set(assetIds).size < assetIds.length) issues.push({ code: "REPEATED_ASSET", severity: "warning", message: "Un asset se repite dentro del carrusel." });
  if (previousTitles.some((title) => textSimilarity(title, project.title) >= 0.58)) {
    issues.push({ code: "SIMILAR_TO_HISTORY", severity: "error", message: "El enfoque se parece demasiado a una publicación anterior." });
  }
  const closing = project.slides.at(-1);
  if (closing?.type === "closing" && normalize(closing.cta).split(" ").length < 3) {
    issues.push({ code: "WEAK_CTA", severity: "warning", message: "El CTA es demasiado corto para abrir conversación.", slideId: closing.id });
  }
  if (closing?.type === "closing" && /^(hablemos|conoce mas|que opinas|escribenos|contactanos)$/i.test(normalize(closing.cta))) {
    issues.push({ code: "GENERIC_CTA", severity: "warning", message: "El CTA es genérico; relaciónalo con una decisión concreta del tema.", slideId: closing.id });
  }

  const penalty = issues.reduce((total, issue) => total + (issue.severity === "error" ? 18 : issue.severity === "warning" ? 7 : 2), 0);
  return { score: Math.max(0, 100 - penalty), issues, checkedAt: new Date().toISOString() };
}
