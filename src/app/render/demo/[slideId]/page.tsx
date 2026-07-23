import { notFound } from "next/navigation";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { demoProject, getDemoSlide } from "@/data/demo-project";
import { assetCatalog, getAssetById } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";

export const dynamic = "force-dynamic";

export default async function RenderSlidePage({ params, searchParams }: { params: Promise<{ slideId: string }>; searchParams: Promise<{ asset?: string }> }) {
  const { slideId } = await params;
  const { asset: requestedAssetId } = await searchParams;
  const slide = getDemoSlide(slideId);
  if (!slide) notFound();
  const automatic = assignAssetsToProject(demoProject, assetCatalog);
  const asset = getAssetById(requestedAssetId) ?? getAssetById(automatic[slide.id]);
  return <main className="render-page"><SlideRenderer project={demoProject} slide={slide} asset={asset} /></main>;
}
