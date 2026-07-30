import assetManifest from "@/data/assets-manifest.json";
import type { Asset, AssetCategory } from "@/types/carousel";

export const assetCatalog = assetManifest as Asset[];

const curatedVectorIds = new Set([
  "automation-002", "automation-004", "automation-005", "automation-019",
  "web-002", "web-004", "web-010", "web-015",
  "ai-001", "ai-003", "ai-015", "ai-018",
  "analytics-001", "analytics-005", "analytics-009", "analytics-017",
  "business-002", "business-003", "business-009", "business-013",
]);

export const recommendedAssetCatalog = assetCatalog.filter(
  (asset) => asset.active && (asset.mediaType === "raster" || curatedVectorIds.has(asset.id)),
).sort((left, right) => Number(right.mediaType === "raster") - Number(left.mediaType === "raster"));

export function getAssetById(id?: string) {
  if (!id) return undefined;
  return assetCatalog.find((asset) => asset.id === id && asset.active);
}

export function searchAssets(query: string, category?: AssetCategory) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return assetCatalog.filter((asset) => {
    if (!asset.active || (category && asset.category !== category)) return false;
    if (!terms.length) return true;
    const haystack = `${asset.id} ${asset.name} ${asset.motif} ${asset.visualStyle ?? ""} ${asset.category} ${asset.tags.join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
