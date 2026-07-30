import { recommendedAssetCatalog } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";
import type { AiCarouselOutput, CreateCarouselInput } from "@/lib/ai/schemas";
import { prisma } from "@/lib/db";
import type { CarouselProject, CarouselSlide, TemplateId } from "@/types/carousel";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import { isTemplateCompatible, selectTemplateId } from "@/lib/templates/catalog";
import { applyVisualStyle } from "@/lib/templates/visualStyle";
import { reviewProject } from "@/lib/quality/reviewProject";

function linkedInCopy(output: AiCarouselOutput) {
  return [output.linkedin.hook, output.linkedin.body, output.linkedin.question, output.linkedin.hashtags.join(" ")].join("\n\n");
}

function projectIdFromCacheKey(cacheKey: string) {
  return `project-${cacheKey.slice(0, 20)}`;
}

function outputToSlides(projectId: string, output: AiCarouselOutput): CarouselSlide[] {
  return output.slides.map((slide, order) => {
    const base = { id: `${projectId}-slide-${order + 1}`, order, visualTags: slide.visualTags };
    if (slide.type === "cover") return { ...base, type: "cover", templateId: selectTemplateId("cover", projectId, order), title: slide.title, subtitle: slide.subtitle };
    if (slide.type === "content") return { ...base, type: "content", templateId: selectTemplateId("content", projectId, order), number: slide.number, title: slide.title, body: slide.body, highlight: slide.highlight };
    return { ...base, type: "closing", templateId: selectTemplateId("closing", projectId, order), title: slide.title, body: slide.body, cta: slide.cta };
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
    editorialStatus: input.scheduledAt ? "scheduled" : "review",
    editorialProfile: input.editorialProfile ?? "kalliom-professional",
    visualStyle: input.visualStyle ?? "balanced",
    contentState: "new",
    scheduledAt: input.scheduledAt,
    batchId: input.batchId,
    qualityReport: { score: 0, issues: [], checkedAt: "" },
    brand: { name: "Kalliom", website: "kalliom.com" },
    slides: outputToSlides(id, output),
    linkedInCopy: linkedInCopy(output),
  };
  const styledProject = { ...applyVisualStyle(baseProject, input.visualStyle ?? "balanced"), status: "generated" as const };
  const assignments = assignAssetsToProject(styledProject, recommendedAssetCatalog);
  const previousTitles = await prisma.project.findMany({ where: { id: { not: id } }, orderBy: { updatedAt: "desc" }, take: 20, select: { title: true } });
  const projectWithAssets = { ...styledProject, slides: styledProject.slides.map((slide) => ({ ...slide, assetId: assignments[slide.id] })) };
  const project = { ...projectWithAssets, qualityReport: reviewProject(projectWithAssets, previousTitles.map((item) => item.title)) };

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
        editorialStatus: project.editorialStatus,
        editorialProfile: project.editorialProfile,
        visualStyle: project.visualStyle,
        contentState: "new",
        scheduledAt: project.scheduledAt ? new Date(project.scheduledAt) : null,
        batchId: project.batchId,
        qualityScore: project.qualityReport.score,
        qualityReport: JSON.stringify(project.qualityReport),
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
        editorialStatus: project.editorialStatus,
        editorialProfile: project.editorialProfile,
        visualStyle: project.visualStyle,
        contentState: "new",
        scheduledAt: project.scheduledAt ? new Date(project.scheduledAt) : null,
        batchId: project.batchId,
        qualityScore: project.qualityReport.score,
        qualityReport: JSON.stringify(project.qualityReport),
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
  let qualityReport: CarouselProject["qualityReport"] = { score: record.qualityScore, issues: [], checkedAt: "" };
  try { qualityReport = JSON.parse(record.qualityReport) as CarouselProject["qualityReport"]; } catch {}
  const slides: CarouselSlide[] = record.slides.map((slide) => {
    const base = {
      id: slide.id,
      order: slide.order,
      visualTags: JSON.parse(slide.visualTags) as string[],
      assetId: slide.assetId ?? undefined,
    };
    const templateId: TemplateId = isTemplateCompatible(slide.type as CarouselSlide["type"], slide.templateId)
      ? slide.templateId as TemplateId
      : slide.type as TemplateId;
    if (slide.type === "cover") return { ...base, type: "cover", templateId, title: slide.title, subtitle: slide.subtitle ?? "" };
    if (slide.type === "content") return { ...base, type: "content", templateId, number: slide.order, title: slide.title, body: slide.body ?? "", highlight: slide.highlight ?? "" };
    return { ...base, type: "closing", templateId, title: slide.title, body: slide.body ?? "", cta: slide.cta ?? "" };
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
    editorialStatus: record.editorialStatus as CarouselProject["editorialStatus"],
    editorialProfile: record.editorialProfile as CarouselProject["editorialProfile"],
    visualStyle: record.visualStyle as CarouselProject["visualStyle"],
    contentState: record.contentState as CarouselProject["contentState"],
    scheduledAt: record.scheduledAt?.toISOString(),
    batchId: record.batchId ?? undefined,
    qualityReport,
    brand: { name: "Kalliom", website: "kalliom.com" },
    slides,
    linkedInCopy: record.linkedInCopy,
  };
}

export async function updateProject(id: string, rawProject: unknown): Promise<CarouselProject | null> {
  const existing = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return null;
  const project = carouselProjectSchema.parse(rawProject) as CarouselProject;
  if (project.id !== id) throw new Error("PROJECT_ID_MISMATCH");
  const cover = project.slides[0];
  if (cover.type !== "cover") throw new Error("INVALID_COVER");
  const previousTitles = await prisma.project.findMany({ where: { id: { not: id } }, orderBy: { updatedAt: "desc" }, take: 20, select: { title: true } });
  const qualityReport = reviewProject(project, previousTitles.map((item) => item.title));

  await prisma.$transaction(async (transaction) => {
    await transaction.project.update({
      where: { id },
      data: {
        title: cover.title,
        subtitle: cover.subtitle,
        slideCount: project.slides.length,
        status: "draft",
        editorialStatus: project.editorialStatus,
        editorialProfile: project.editorialProfile,
        visualStyle: project.visualStyle,
        contentState: project.contentState,
        scheduledAt: project.scheduledAt ? new Date(project.scheduledAt) : null,
        batchId: project.batchId,
        qualityScore: qualityReport.score,
        qualityReport: JSON.stringify(qualityReport),
        linkedInCopy: project.linkedInCopy,
      },
    });
    await transaction.slide.deleteMany({ where: { projectId: id } });
    await transaction.slide.createMany({
      data: project.slides.map((slide, order) => ({
        id: slide.id,
        projectId: id,
        order,
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
  return getProjectById(id);
}

export async function setProjectStatus(id: string, status: CarouselProject["status"]) {
  await prisma.project.update({ where: { id }, data: { status } });
}

export type ProjectHistoryItem = {
  id: string;
  topic: string;
  title: string;
  slideCount: number;
  status: CarouselProject["status"];
  category: CarouselProject["category"];
  editorialStatus: CarouselProject["editorialStatus"];
  contentState: CarouselProject["contentState"];
  scheduledAt?: string;
  qualityScore: number;
  batchId?: string;
  createdAt: string;
  updatedAt: string;
};

export async function listProjects(limit = 30): Promise<ProjectHistoryItem[]> {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
    select: {
      id: true,
      topic: true,
      title: true,
      slideCount: true,
      status: true,
      category: true,
      editorialStatus: true,
      contentState: true,
      scheduledAt: true,
      qualityScore: true,
      batchId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return projects.map((project) => ({
    ...project,
    status: project.status as CarouselProject["status"],
    category: project.category as CarouselProject["category"],
    editorialStatus: project.editorialStatus as CarouselProject["editorialStatus"],
    contentState: project.contentState as CarouselProject["contentState"],
    scheduledAt: project.scheduledAt?.toISOString(),
    qualityScore: project.qualityScore,
    batchId: project.batchId ?? undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }));
}

export async function recentEditorialMemory(limit = 12) {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: Math.min(Math.max(limit, 1), 30),
    select: { topic: true, title: true },
  });
  return projects.map((project) => `${project.title} — ${project.topic}`.slice(0, 180));
}

export async function updateEditorialSchedule(id: string, input: {
  scheduledAt?: string;
  editorialStatus: CarouselProject["editorialStatus"];
}) {
  await prisma.project.update({
    where: { id },
    data: {
      editorialStatus: input.editorialStatus,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
    },
  });
  return getProjectById(id);
}

export async function updateContentState(id: string, contentState: CarouselProject["contentState"]) {
  const project = await prisma.project.update({
    where: { id },
    data: { contentState },
    select: { id: true, contentState: true },
  });
  return { id: project.id, contentState: project.contentState as CarouselProject["contentState"] };
}

export async function saveQualityReport(id: string, report: CarouselProject["qualityReport"]) {
  await prisma.project.update({
    where: { id },
    data: { qualityScore: report.score, qualityReport: JSON.stringify(report) },
  });
}
