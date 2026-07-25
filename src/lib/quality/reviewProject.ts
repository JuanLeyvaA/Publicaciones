import type { CarouselProject, QualityIssue, QualityReport } from "@/types/carousel";

const clichés = [
  "llevar al siguiente nivel",
  "en un mundo cada vez más",
  "la clave del éxito",
  "revolucionar",
  "game changer",
  "sin límites",
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function words(value: string) {
  return new Set(normalize(value).split(" ").filter((word) => word.length > 3));
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
  const allText = project.slides.map((slide) => {
    const extra = slide.type === "cover" ? slide.subtitle : slide.type === "content" ? `${slide.body} ${slide.highlight}` : `${slide.body} ${slide.cta}`;
    return `${slide.title} ${extra}`;
  }).join(" ");

  for (const slide of project.slides) {
    const normalizedTitle = normalize(slide.title);
    if (seenTitles.has(normalizedTitle)) issues.push({ code: "DUPLICATE_SLIDE_TITLE", severity: "error", message: "Hay títulos repetidos dentro del carrusel.", slideId: slide.id });
    seenTitles.set(normalizedTitle, slide.id);
    if (textSimilarity(slide.title, project.topic) > 0.8) issues.push({ code: "TOPIC_AS_TITLE", severity: "warning", message: "El título repite demasiado literalmente el tema.", slideId: slide.id });
  }

  for (const cliché of clichés) {
    if (normalize(allText).includes(normalize(cliché))) issues.push({ code: "CLICHE", severity: "warning", message: `Evita el cliché “${cliché}”.` });
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

  const penalty = issues.reduce((total, issue) => total + (issue.severity === "error" ? 18 : issue.severity === "warning" ? 7 : 2), 0);
  return { score: Math.max(0, 100 - penalty), issues, checkedAt: new Date().toISOString() };
}
