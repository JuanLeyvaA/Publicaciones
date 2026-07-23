import { assetCatalog } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";
import type { AiCarouselOutput, CreateCarouselInput } from "@/lib/ai/schemas";
import { prisma } from "@/lib/db";
import type { CarouselProject, CarouselSlide } from "@/types/carousel";

function linkedInCopy(output: AiCarouselOutput) {
  return [output.linkedin.hook, output.linkedin.body, output.linkedin.question, output.linkedin.hashtags.join(" ")].join("\n\n");
}

function projectIdFromCacheKey(cacheKey: string) {
  return `project-${cacheKey.slice(0, 20)}`;
}

function outputToSlides(projectId: string, output: AiCarouselOutput): CarouselSlide[] {
  return output.slides.map((slide, order) => {
    const base = { id: `${projectId}-slide-${order + 1}`, order, visualTags: slide.visualTags };
    if (slide.type === "cover") return { ...base, type: "cover", templateId: "cover", title: slide.title, subtitle: slide.subtitle };
    if (slide.type === "content") return { ...base, type: "content", templateId: "content", number: slide.number, title: slide.title, body: slide.body, highlight: slide.highlight };
    return { ...base, type: "closing", templateId: "closing", title: slide.title, body: slide.body, cta: slide.cta };
  });
}

export async function persistGeneratedProject(input: CreateCarouselInput, cacheKey: string, output: AiCarouselOutput, model: string, estimatedTokens: number) {
  const id = projectIdFromCacheKey(cacheKey);
  const baseProject: CarouselProject = {
    id,
    topic: input.topic,
    title: output.title,
    subtitle: output.subtitle,
    slideCount: input.slideCount,
    category: input.category,
    language: input.language,
    tone: input.tone,
    status: "generated",
    brand: { name: "Kalliom", website: "kalliom.com" },
    slides: outputToSlides(id, output),
    linkedInCopy: linkedInCopy(output),
  };
  const assignments = assignAssetsToProject(baseProject, assetCatalog);
  const project = { ...baseProject, slides: baseProject.slides.map((slide) => ({ ...slide, assetId: assignments[slide.id] })) };

  await prisma.$transaction(async (transaction) => {
    await transaction.project.upsert({
      where: { id },
      update: {
        title: project.title,
        subtitle: project.subtitle,
        linkedInCopy: project.linkedInCopy,
        model,
        estimatedTokens,
        status: "generated",
      },
      create: {
        id,
        cacheKey,
        topic: project.topic,
        title: project.title,
        subtitle: project.subtitle,
        slideCount: project.slideCount,
        category: project.category,
        language: project.language,
        tone: project.tone,
        status: project.status,
        linkedInCopy: project.linkedInCopy,
        model,
        estimatedTokens,
      },
    });
    await transaction.slide.deleteMany({ where: { projectId: id } });
    await transaction.slide.createMany({
      data: project.slides.map((slide) => ({
        id: slide.id,
        projectId: id,
        order: slide.order,
        type: slide.type,
        title: slide.title,
        subtitle: slide.type === "cover" ? slide.subtitle : null,
        body: slide.type === "content" || slide.type === "closing" ? slide.body : null,
        highlight: slide.type === "content" ? slide.highlight : null,
        cta: slide.type === "closing" ? slide.cta : null,
        visualTags: JSON.stringify(slide.visualTags),
        templateId: slide.templateId,
        assetId: slide.assetId,
      })),
    });
  });
  return project;
}

export async function getProjectById(id: string): Promise<CarouselProject | null> {
  const record = await prisma.project.findUnique({ where: { id }, include: { slides: { orderBy: { order: "asc" } } } });
  if (!record) return null;
  const slides: CarouselSlide[] = record.slides.map((slide) => {
    const base = {
      id: slide.id,
      order: slide.order,
      visualTags: JSON.parse(slide.visualTags) as string[],
      assetId: slide.assetId ?? undefined,
    };
    if (slide.type === "cover") return { ...base, type: "cover", templateId: "cover", title: slide.title, subtitle: slide.subtitle ?? "" };
    if (slide.type === "content") return { ...base, type: "content", templateId: "content", number: slide.order, title: slide.title, body: slide.body ?? "", highlight: slide.highlight ?? "" };
    return { ...base, type: "closing", templateId: "closing", title: slide.title, body: slide.body ?? "", cta: slide.cta ?? "" };
  });
  return {
    id: record.id,
    topic: record.topic,
    title: record.title,
    subtitle: record.subtitle,
    slideCount: record.slideCount,
    category: record.category as CarouselProject["category"],
    language: record.language as CarouselProject["language"],
    tone: record.tone as CarouselProject["tone"],
    status: record.status as CarouselProject["status"],
    brand: { name: "Kalliom", website: "kalliom.com" },
    slides,
    linkedInCopy: record.linkedInCopy,
  };
}
