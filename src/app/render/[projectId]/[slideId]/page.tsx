import { notFound } from "next/navigation";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { getAssetById, recommendedAssetCatalog } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";
import { demoProject } from "@/data/demo-project";
import { getProjectById } from "@/lib/projects/repository";
import { isTemplateCompatible } from "@/lib/templates/catalog";

export const dynamic = "force-dynamic";

export default async function ProjectRenderPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; slideId: string }>;
  searchParams: Promise<{ asset?: string; template?: string }>;
}) {
  const { projectId, slideId } = await params;
  const { asset: requestedAssetId, template: requestedTemplateId } = await searchParams;
  const project = projectId === demoProject.id ? demoProject : await getProjectById(projectId);
  if (!project) notFound();
  const slide = project.slides.find((item) => item.id === slideId);
  if (!slide) notFound();
  const automatic = assignAssetsToProject(project, recommendedAssetCatalog);
  const asset = getAssetById(requestedAssetId) ?? getAssetById(slide.assetId) ?? getAssetById(automatic[slide.id]);
  const renderedSlide = requestedTemplateId && isTemplateCompatible(slide.type, requestedTemplateId)
    ? { ...slide, templateId: requestedTemplateId }
    : slide;
  return <main className="render-page"><SlideRenderer project={project} slide={renderedSlide} asset={asset} /></main>;
}
