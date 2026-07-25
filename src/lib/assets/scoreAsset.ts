import type { Asset, AssetCategory, AssetOrientation, AssetPlacement, SlideType, VisualStyle } from "@/types/carousel";

export type AssetScoreContext = {
  visualTags: string[];
  category: AssetCategory;
  layoutType: SlideType;
  preferredOrientation: AssetOrientation;
  usedAssetIds: ReadonlySet<string>;
  recentlyUsedAssetIds: ReadonlySet<string>;
  usedPlacements: ReadonlySet<AssetPlacement>;
  usedVisualStyles?: ReadonlySet<string>;
  visualStyle?: VisualStyle;
};

export function scoreAsset(asset: Asset, context: AssetScoreContext) {
  if (!asset.active) return Number.NEGATIVE_INFINITY;
  const normalizedTags = new Set(context.visualTags.map((tag) => tag.toLowerCase()));
  const exactMatches = asset.tags.reduce((count, tag) => count + (normalizedTags.has(tag.toLowerCase()) ? 1 : 0), 0);
  return exactMatches * 5
    + (asset.category === context.category ? 3 : 0)
    + (asset.compatibleLayouts.includes(context.layoutType) ? 2 : 0)
    + (asset.orientation === context.preferredOrientation ? 1 : 0)
    + (asset.mediaType === "raster" && context.visualStyle === "image-led" ? 5 : 0)
    + (asset.mediaType === "raster" && context.visualStyle === "bold" ? 2 : 0)
    - (asset.mediaType === "raster" && (context.visualStyle === "minimal" || context.visualStyle === "text-led") ? 2 : 0)
    - (context.usedAssetIds.has(asset.id) ? 5 : 0)
    - (context.recentlyUsedAssetIds.has(asset.id) ? 3 : 0)
    - (context.usedPlacements.has(asset.placement) ? 4 : 0)
    - (asset.visualStyle && context.usedVisualStyles?.has(asset.visualStyle) ? 4 : 0);
}
