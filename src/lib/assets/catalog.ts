import assetManifest from "@/data/assets-manifest.json";
import type { Asset, AssetCategory, CarouselProject } from "@/types/carousel";

export const assetCatalog = assetManifest as Asset[];

const curatedVectorIds = new Set([
  "automation-002", "automation-004", "automation-005", "automation-019",
  "web-002", "web-004", "web-010", "web-015",
  "ai-001", "ai-003", "ai-015", "ai-018",
  "analytics-001", "analytics-005", "analytics-009", "analytics-017",
  "business-002", "business-003", "business-009", "business-013",
]);

// Los renders raster actuales son imágenes sintéticas. La selección automática
// usa ilustración gráfica para que la identidad visual no dependa de clichés de IA.
export const recommendedAssetCatalog = assetCatalog.filter(
  (asset) => asset.active && curatedVectorIds.has(asset.id),
);

export function getAssetById(id?: string) {
  if (!id) return undefined;
  return assetCatalog.find((asset) => asset.id === id && asset.active);
}

export function getRecommendedAssetById(id?: string) {
  const asset = getAssetById(id);
  return asset?.mediaType === "raster" ? undefined : asset;
}

export function referenceImageAssets(urls: string[]): Asset[] {
  return urls.map((path, index) => ({
    id: `reference-${index + 1}`,
    name: `foto de referencia ${index + 1}`,
    motif: "fotografia aportada",
    path,
    category: "business",
    tags: ["photo", "reference"],
    orientation: "vertical",
    transparent: false,
    compatibleLayouts: ["cover", "content", "closing"],
    placement: index % 2 ? "right" : "left",
    scale: "large",
    rotation: 0,
    mediaType: "raster",
    visualStyle: "user-photo",
    active: true,
  }));
}

export function getProjectAsset(project: Pick<CarouselProject, "referenceImageUrls">, id?: string) {
  const reference = referenceImageAssets(project.referenceImageUrls).find((asset) => asset.id === id);
  return reference ?? getRecommendedAssetById(id);
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
