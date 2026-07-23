import { describe, expect, it } from "vitest";
import { demoProject } from "@/data/demo-project";
import { assetCatalog, searchAssets } from "@/lib/assets/catalog";
import { scoreAsset } from "@/lib/assets/scoreAsset";
import { assignAssetsToProject, selectAssetForSlide } from "@/lib/assets/selectAsset";

describe("biblioteca local de assets", () => {
  it("contiene 40 assets activos con rutas internas", () => {
    expect(assetCatalog).toHaveLength(40);
    expect(assetCatalog.every((asset) => asset.active && asset.path.startsWith("/assets/library/"))).toBe(true);
  });

  it("busca por categoría y etiquetas sin IA", () => {
    const results = searchAssets("dashboard growth", "analytics");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((asset) => asset.category === "analytics")).toBe(true);
  });

  it("aplica la penalización por repetición y uso reciente", () => {
    const asset = assetCatalog[0];
    const base = {
      visualTags: asset.tags,
      category: asset.category,
      templateId: "content" as const,
      preferredOrientation: asset.orientation,
      usedAssetIds: new Set<string>(),
      recentlyUsedAssetIds: new Set<string>(),
    };
    const normal = scoreAsset(asset, base);
    const penalized = scoreAsset(asset, {
      ...base,
      usedAssetIds: new Set([asset.id]),
      recentlyUsedAssetIds: new Set([asset.id]),
    });
    expect(normal - penalized).toBe(8);
  });

  it("desempata de manera determinista usando proyecto, slide y asset", () => {
    const slide = demoProject.slides[1];
    const first = selectAssetForSlide(demoProject, slide, assetCatalog);
    const second = selectAssetForSlide(demoProject, slide, [...assetCatalog].reverse());
    expect(first?.id).toBe(second?.id);
  });

  it("evita repetir assets dentro del mismo carrusel", () => {
    const assignments = assignAssetsToProject(demoProject, assetCatalog);
    expect(Object.keys(assignments)).toHaveLength(demoProject.slideCount);
    expect(new Set(Object.values(assignments)).size).toBe(demoProject.slideCount);
  });
});
