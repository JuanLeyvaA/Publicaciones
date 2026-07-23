import type { Asset, AssetCategory, AssetOrientation, SlideType } from "@/types/carousel";

export type AssetScoreContext = {
  visualTags: string[];
  category: AssetCategory;
  templateId: SlideType;
  preferredOrientation: AssetOrientation;
  usedAssetIds: ReadonlySet<string>;
  recentlyUsedAssetIds: ReadonlySet<string>;
};

export function scoreAsset(asset: Asset, context: AssetScoreContext) {
  if (!asset.active) return Number.NEGATIVE_INFINITY;
  const normalizedTags = new Set(context.visualTags.map((tag) => tag.toLowerCase()));
  const exactMatches = asset.tags.reduce((count, tag) => count + (normalizedTags.has(tag.toLowerCase()) ? 1 : 0), 0);
  return exactMatches * 5
    + (asset.category === context.category ? 3 : 0)
    + (asset.compatibleLayouts.includes(context.templateId) ? 2 : 0)
    + (asset.orientation === context.preferredOrientation ? 1 : 0)
    - (context.usedAssetIds.has(asset.id) ? 5 : 0)
    - (context.recentlyUsedAssetIds.has(asset.id) ? 3 : 0);
}
