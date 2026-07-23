import { notFound } from "next/navigation";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { assetCatalog, getAssetById } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";
import { demoProject } from "@/data/demo-project";
import { getProjectById } from "@/lib/projects/repository";

export const dynamic = "force-dynamic";

export default async function ProjectRenderPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string; slideId: string }>;
  searchParams: Promise<{ asset?: string }>;
}) {
  const { projectId, slideId } = await params;
  const { asset: requestedAssetId } = await searchParams;
  const project = projectId === demoProject.id ? demoProject : await getProjectById(projectId);
  if (!project) notFound();
  const slide = project.slides.find((item) => item.id === slideId);
  if (!slide) notFound();
  const automatic = assignAssetsToProject(project, assetCatalog);
  const asset = getAssetById(requestedAssetId) ?? getAssetById(slide.assetId) ?? getAssetById(automatic[slide.id]);
  return <main className="render-page"><SlideRenderer project={project} slide={slide} asset={asset} /></main>;
}
