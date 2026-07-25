import assetManifest from "@/data/assets-manifest.json";
import type { Asset, AssetCategory } from "@/types/carousel";

export const assetCatalog = assetManifest as Asset[];

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
