import type { ReactNode } from "react";
import { SlideCanvas } from "@/components/slides/SlideCanvas";
import { SlideCounter } from "@/components/slides/SlideCounter";
import { SlideHeader } from "@/components/slides/SlideHeader";
import { AssetVisual } from "@/components/assets/AssetVisual";
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
};

export function TemplateFrame({ children, slideId, variant, templateId, brand, index, total, asset }: Props) {
  return (
    <SlideCanvas slideId={slideId} className={`template-${variant} template-layout-${templateId} asset-placement-${asset?.placement ?? "right"}`}>
      <div className="background-art" aria-hidden="true" />
      <div className="ambient-orb orb-one" aria-hidden="true" />
      <div className="ambient-orb orb-two" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />
      <AssetVisual asset={asset} variant={variant} />
      <div className="safe-area" data-safe-area="true">
        <SlideHeader brand={brand} index={index} total={total} />
        {children}
        <SlideCounter index={index} total={total} />
      </div>
    </SlideCanvas>
  );
}
