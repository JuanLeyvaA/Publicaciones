import type { Asset, AssetPlacement, CarouselProject, CarouselSlide } from "@/types/carousel";
import { scoreAsset } from "@/lib/assets/scoreAsset";

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function preferredOrientation(slide: CarouselSlide) {
  return slide.type === "closing" ? "square" as const : "vertical" as const;
}

export function selectAssetForSlide(
  project: CarouselProject,
  slide: CarouselSlide,
  assets: Asset[],
  usedAssetIds = new Set<string>(),
  recentlyUsedAssetIds = new Set<string>(),
  usedPlacements = new Set<AssetPlacement>(),
  usedVisualStyles = new Set<string>(),
) {
  const active = assets.filter((asset) => asset.active && asset.compatibleLayouts.includes(slide.type));
  if (!active.length) return undefined;
  const unused = active.filter((asset) => !usedAssetIds.has(asset.id));
  const freshPlacements = unused.filter((asset) => !usedPlacements.has(asset.placement));
  const candidates = freshPlacements.length ? freshPlacements : unused.length ? unused : active;
  return candidates
    .map((asset) => ({
      asset,
      score: scoreAsset(asset, {
        visualTags: slide.visualTags,
        category: project.category,
        layoutType: slide.type,
        preferredOrientation: preferredOrientation(slide),
        usedAssetIds,
        recentlyUsedAssetIds,
        usedPlacements,
        usedVisualStyles,
        visualStyle: project.visualStyle,
      }),
      tie: stableHash(`${project.id}:${slide.id}:${asset.id}`),
    }))
    .sort((left, right) => right.score - left.score || left.tie - right.tie || left.asset.id.localeCompare(right.asset.id))[0]?.asset;
}

export function assignAssetsToProject(project: CarouselProject, assets: Asset[], recentlyUsedAssetIds = new Set<string>()) {
  const assignments: Record<string, string> = {};
  const used = new Set<string>();
  const usedPlacements = new Set<AssetPlacement>();
  const usedVisualStyles = new Set<string>();
  for (const slide of [...project.slides].sort((a, b) => a.order - b.order)) {
    const selected = selectAssetForSlide(project, slide, assets, used, recentlyUsedAssetIds, usedPlacements, usedVisualStyles);
    if (!selected) continue;
    assignments[slide.id] = selected.id;
    used.add(selected.id);
    usedPlacements.add(selected.placement);
    if (selected.visualStyle) usedVisualStyles.add(selected.visualStyle);
  }
  return assignments;
}
