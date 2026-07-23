import type { Asset, AssetCategory } from "@/types/carousel";

const categoryConfig: Record<AssetCategory, { file: string; tags: string[] }> = {
  automation: { file: "automation", tags: ["automation", "workflow", "integration", "process", "customer-service"] },
  web: { file: "web", tags: ["web", "interface", "website", "laptop", "digital"] },
  "artificial-intelligence": { file: "ai", tags: ["artificial-intelligence", "ai", "chatbot", "neural", "technology"] },
  analytics: { file: "analytics", tags: ["analytics", "dashboard", "data", "metrics", "growth"] },
  business: { file: "business", tags: ["business", "sales", "team", "strategy", "connection"] },
};

const variantTags = [
  ["network", "connection"],
  ["growth", "performance"],
  ["system", "operations"],
  ["communication", "customer-service"],
  ["strategy", "planning"],
  ["efficiency", "speed"],
  ["data", "insight"],
  ["future", "innovation"],
] as const;

export const assetCatalog: Asset[] = Object.entries(categoryConfig).flatMap(([category, config]) =>
  variantTags.map((extraTags, index) => ({
    id: `${config.file}-${String(index + 1).padStart(3, "0")}`,
    path: `/assets/library/${config.file}-${String(index + 1).padStart(2, "0")}.svg`,
    category: category as AssetCategory,
    tags: [...config.tags, ...extraTags],
    orientation: "vertical" as const,
    transparent: true,
    compatibleLayouts: index % 4 === 0 ? ["cover", "content", "closing"] : index % 3 === 0 ? ["content", "closing"] : ["cover", "content"],
    active: true,
  })),
);

export function getAssetById(id?: string) {
  if (!id) return undefined;
  return assetCatalog.find((asset) => asset.id === id && asset.active);
}

export function searchAssets(query: string, category?: AssetCategory) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return assetCatalog.filter((asset) => {
    if (!asset.active || (category && asset.category !== category)) return false;
    if (!terms.length) return true;
    const haystack = `${asset.id} ${asset.category} ${asset.tags.join(" ")}`.toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
