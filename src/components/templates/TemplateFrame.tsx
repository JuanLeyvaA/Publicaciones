import { movableElement } from "@/lib/templates/movableElement";
import { hasManualLayout } from "@/lib/templates/manualLayout";
import type { ReactNode } from "react";
import { SlideCanvas } from "@/components/slides/SlideCanvas";
import { SlideCounter } from "@/components/slides/SlideCounter";
import { SlideHeader } from "@/components/slides/SlideHeader";
import { AssetVisual } from "@/components/assets/AssetVisual";
import { SlideAutoFit } from "@/components/templates/SlideAutoFit";
import { artDirectionClass, type ArtDirectionId } from "@/lib/templates/artDirection";
import type { Asset } from "@/types/carousel";
import type { SlideAppearance, TemplateId } from "@/types/carousel";

type Props = {
  children: ReactNode;
  slideId: string;
  variant: "cover" | "content" | "closing";
  templateId: TemplateId;
  brand: string;
  index: number;
  total: number;
  asset?: Asset;
  fitKey: string;
  direction: ArtDirectionId;
  appearance?: SlideAppearance;
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function TemplateFrame({ children, slideId, variant, templateId, brand, index, total, asset, fitKey, direction, appearance }: Props) {
  const scene = stableHash(`${slideId}:${templateId}:scene`) % 12;
  const composition = stableHash(`${slideId}:${templateId}:composition`) % 6;
  const assetFrame = stableHash(`${slideId}:${asset?.id ?? "none"}:frame`) % 6;
  const placement = appearance?.assetPlacement ?? asset?.placement ?? "right";
  return (
    <SlideCanvas slideId={slideId} className={`template-${variant} template-layout-${templateId} ${artDirectionClass(direction)} asset-placement-${asset?.placement ?? "right"} background-variant-${scene} composition-variant-${composition} asset-frame-${assetFrame}${appearance?.hiddenElements?.includes("background") ? " background-removed" : ""}`}>
      {appearance?.showBackground !== false && <><div className="background-art" data-selectable-element="background" data-element-hidden={appearance?.hiddenElements?.includes("background") ? "true" : undefined} aria-hidden="true" /><div className="noise" data-selectable-element="texture" data-element-hidden={appearance?.hiddenElements?.includes("texture") ? "true" : undefined} aria-hidden="true" /></>}
      {appearance?.showDecor !== false && <><div className="ambient-orb orb-one" {...movableElement(appearance, "orb-one")} aria-hidden="true" /><div className="ambient-orb orb-two" {...movableElement(appearance, "orb-two")} aria-hidden="true" /><div className="template-decor decor-one" {...movableElement(appearance, "decor-one")} aria-hidden="true" /><div className="template-decor decor-two" {...movableElement(appearance, "decor-two")} aria-hidden="true" /><div className="template-decor decor-three" {...movableElement(appearance, "decor-three")} aria-hidden="true" /><div className="creative-frame" {...movableElement(appearance, "frame")} aria-hidden="true"><span /><span /><span /><span /></div></>}
      {appearance?.showAsset !== false && !appearance?.hiddenElements?.includes("asset") && <AssetVisual asset={asset ? { ...asset, placement } : undefined} variant={variant} />}
      <div className="safe-area" data-safe-area="true">
        {appearance?.showHeader !== false && !appearance?.hiddenElements?.includes("header") && <SlideHeader brand={brand} index={index} total={total} direction={direction} series={appearance?.texts?.series} />}
        {children}
        {appearance?.showFooter !== false && !appearance?.hiddenElements?.includes("footer") && <SlideCounter index={index} total={total} direction={direction} series={appearance?.texts?.series} />}
        <SlideAutoFit manualLayout={hasManualLayout(appearance)} fontSizes={appearance?.fontSizes} fitKey={`${templateId}:${asset?.id ?? "none"}:${fitKey}:${JSON.stringify(appearance)}`} />
      </div>
    </SlideCanvas>
  );
}
