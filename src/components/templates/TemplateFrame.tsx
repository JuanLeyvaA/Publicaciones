import type { ReactNode } from "react";
import { SlideCanvas } from "@/components/slides/SlideCanvas";
import { SlideCounter } from "@/components/slides/SlideCounter";
import { SlideHeader } from "@/components/slides/SlideHeader";
import { AssetVisual } from "@/components/assets/AssetVisual";
import { SlideAutoFit } from "@/components/templates/SlideAutoFit";
import type { Asset } from "@/types/carousel";
import type { TemplateId } from "@/types/carousel";

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
};

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function TemplateFrame({ children, slideId, variant, templateId, brand, index, total, asset, fitKey }: Props) {
  const scene = stableHash(`${slideId}:${templateId}:scene`) % 12;
  const composition = stableHash(`${slideId}:${templateId}:composition`) % 6;
  const assetFrame = stableHash(`${slideId}:${asset?.id ?? "none"}:frame`) % 6;
  return (
    <SlideCanvas slideId={slideId} className={`template-${variant} template-layout-${templateId} asset-placement-${asset?.placement ?? "right"} background-variant-${scene} composition-variant-${composition} asset-frame-${assetFrame}`}>
      <div className="background-art" aria-hidden="true" />
      <div className="ambient-orb orb-one" aria-hidden="true" />
      <div className="ambient-orb orb-two" aria-hidden="true" />
      <div className="template-decor decor-one" aria-hidden="true" />
      <div className="template-decor decor-two" aria-hidden="true" />
      <div className="template-decor decor-three" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <AssetVisual asset={asset} variant={variant} />
      <div className="safe-area" data-safe-area="true">
        <SlideHeader brand={brand} index={index} total={total} />
        {children}
        <SlideCounter index={index} total={total} />
        <SlideAutoFit fitKey={`${templateId}:${asset?.id ?? "none"}:${fitKey}`} />
      </div>
    </SlideCanvas>
  );
}
