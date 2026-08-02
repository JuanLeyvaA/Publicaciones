import { describe, expect, it } from "vitest";
import { demoProject } from "@/data/demo-project";
import { assetCatalog, recommendedAssetCatalog, searchAssets } from "@/lib/assets/catalog";
import { scoreAsset, semanticAssetAffinity } from "@/lib/assets/scoreAsset";
import { assignAssetsToProject, selectAssetForSlide } from "@/lib/assets/selectAsset";
import type { AssetPlacement } from "@/types/carousel";

describe("biblioteca local de assets", () => {
  it("contiene más de 100 assets distintos, activos y con rutas internas", () => {
    expect(assetCatalog).toHaveLength(120);
    expect(assetCatalog.every((asset) => asset.active && asset.path.startsWith("/assets/"))).toBe(true);
    expect(new Set(assetCatalog.map((asset) => asset.name)).size).toBe(120);
    expect(new Set(assetCatalog.map((asset) => asset.motif)).size).toBe(120);
    expect(new Set(assetCatalog.map((asset) => asset.path)).size).toBe(120);
  });

  it("distribuye la biblioteca entre categorías, posiciones, escalas y orientaciones", () => {
    for (const category of ["automation", "web", "artificial-intelligence", "analytics", "business"]) {
      expect(assetCatalog.filter((asset) => asset.category === category).length).toBeGreaterThanOrEqual(20);
    }
    expect(new Set(assetCatalog.map((asset) => asset.placement)).size).toBe(7);
    expect(new Set(assetCatalog.map((asset) => asset.scale)).size).toBe(3);
    expect(new Set(assetCatalog.map((asset) => asset.orientation)).size).toBe(3);
  });

  it("incluye veinte recursos raster originales en estilos visuales diferentes", () => {
    const raster = assetCatalog.filter((asset) => asset.mediaType === "raster");
    expect(raster).toHaveLength(20);
    expect(new Set(raster.map((asset) => asset.visualStyle)).size).toBeGreaterThanOrEqual(14);
    expect(raster.filter((asset) => asset.tags.includes("robot")).length).toBeGreaterThanOrEqual(6);
    expect(raster.every((asset) => asset.transparent === false && asset.path.endsWith(".webp"))).toBe(true);
  });

  it("entiende etiquetas visuales en español aunque el catálogo use inglés", () => {
    const robot = assetCatalog.find((asset) => asset.id === "raster-018")!;
    expect(semanticAssetAffinity(robot, ["robot", "tareas", "documentos", "proceso"])).toBeGreaterThan(
      semanticAssetAffinity(robot, ["jardín", "datos", "crecimiento"]),
    );
  });

  it("expone una selección curada sin perder la biblioteca completa", () => {
    expect(recommendedAssetCatalog.length).toBeGreaterThanOrEqual(30);
    expect(recommendedAssetCatalog.length).toBeLessThan(assetCatalog.length);
    expect(recommendedAssetCatalog.every((asset) => asset.active)).toBe(true);
  });

  it("busca por categoría y etiquetas sin IA", () => {
    const results = searchAssets("dashboard kpi", "analytics");
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((asset) => asset.category === "analytics")).toBe(true);
  });

  it("aplica la penalización por repetición y uso reciente", () => {
    const asset = assetCatalog[0];
    const base = {
      visualTags: asset.tags,
      category: asset.category,
      layoutType: "content" as const,
      preferredOrientation: asset.orientation,
      usedAssetIds: new Set<string>(),
      recentlyUsedAssetIds: new Set<string>(),
      usedPlacements: new Set<AssetPlacement>(),
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
    const placements = Object.values(assignments).map((id) => assetCatalog.find((asset) => asset.id === id)?.placement);
    expect(new Set(placements).size).toBe(demoProject.slideCount);
  });

  it("prioriza recursos raster variados cuando el estilo pide assets protagonistas", () => {
    const project = {
      ...demoProject,
      category: "artificial-intelligence" as const,
      visualStyle: "image-led" as const,
      slides: demoProject.slides.map((slide) => ({ ...slide, visualTags: ["ai", "robot", "assistant"] })),
    };
    const assignments = assignAssetsToProject(project, assetCatalog);
    const selected = Object.values(assignments).map((id) => assetCatalog.find((asset) => asset.id === id)!);
    expect(selected.some((asset) => asset.mediaType === "raster")).toBe(true);
    const rasterStyles = selected.filter((asset) => asset.mediaType === "raster").map((asset) => asset.visualStyle);
    expect(new Set(rasterStyles).size).toBe(rasterStyles.length);
  });
});
