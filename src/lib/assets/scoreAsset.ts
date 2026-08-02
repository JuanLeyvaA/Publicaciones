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

const conceptAliases: Record<string, string> = {
  equipo: "team", personas: "people", persona: "people", humano: "human", humana: "human",
  negocio: "business", empresa: "business", pyme: "business", comercio: "retail", tienda: "retail",
  proceso: "workflow", procesos: "workflow", flujo: "workflow", tarea: "task", tareas: "task",
  automatizacion: "automation", robotica: "robot", asistente: "assistant", agente: "assistant",
  datos: "data", dato: "data", analitica: "analytics", metrica: "metrics", metricas: "metrics",
  decision: "decision", decisiones: "decision", estrategia: "strategy", crecimiento: "growth",
  cliente: "customer", clientes: "customer", ventas: "sales", soporte: "support",
  fabrica: "manufacturing", industria: "industrial", oficina: "office", reunion: "meeting",
  documento: "documents", documentos: "documents", papel: "documents", calendario: "calendar",
  seguridad: "security", confianza: "trust", nube: "cloud", integracion: "integration",
  conversacion: "chat", mensaje: "chat", movil: "mobile", telefono: "mobile",
  sitio: "website", web: "web", pantalla: "screen", tablero: "dashboard",
  liderazgo: "leadership", colaboracion: "collaboration", tiempo: "time", reloj: "time",
  maquina: "machine", maquinas: "machine", herramienta: "tools", herramientas: "tools",
  jardin: "garden", planta: "garden", plantas: "garden", mapa: "map", ruta: "map",
};

function normalizedWords(value: string) {
  return value.normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2)
    .map((word) => conceptAliases[word] ?? word);
}

export function semanticAssetAffinity(asset: Asset, visualTags: string[]) {
  const requestedPhrases = new Set(visualTags.map((tag) => normalizedWords(tag).join(" ")).filter(Boolean));
  const requestedWords = new Set(visualTags.flatMap(normalizedWords));
  const assetPhrases = new Set([asset.name, asset.motif, ...asset.tags].map((tag) => normalizedWords(tag).join(" ")).filter(Boolean));
  const assetWords = new Set([asset.name, asset.motif, ...asset.tags].flatMap(normalizedWords));
  const exactPhrases = [...requestedPhrases].filter((phrase) => assetPhrases.has(phrase)).length;
  const sharedWords = [...requestedWords].filter((word) => assetWords.has(word)).length;
  return exactPhrases * 5 + Math.min(sharedWords, 5) * 1.6;
}

export function scoreAsset(asset: Asset, context: AssetScoreContext) {
  if (!asset.active) return Number.NEGATIVE_INFINITY;
  return semanticAssetAffinity(asset, context.visualTags)
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
