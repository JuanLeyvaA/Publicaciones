import { notFound } from "next/navigation";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { demoProject, getDemoSlide } from "@/data/demo-project";
import { getAssetById, recommendedAssetCatalog } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";
import { isTemplateCompatible } from "@/lib/templates/catalog";

export const dynamic = "force-dynamic";

export default async function RenderSlidePage({ params, searchParams }: { params: Promise<{ slideId: string }>; searchParams: Promise<{ asset?: string; template?: string }> }) {
  const { slideId } = await params;
  const { asset: requestedAssetId, template: requestedTemplateId } = await searchParams;
  const slide = getDemoSlide(slideId);
  if (!slide) notFound();
  const automatic = assignAssetsToProject(demoProject, recommendedAssetCatalog);
  const asset = getAssetById(requestedAssetId) ?? getAssetById(automatic[slide.id]);
  const renderedSlide = requestedTemplateId && isTemplateCompatible(slide.type, requestedTemplateId)
    ? { ...slide, templateId: requestedTemplateId }
    : slide;
  return <main className="render-page"><SlideRenderer project={demoProject} slide={renderedSlide} asset={asset} /></main>;
}
