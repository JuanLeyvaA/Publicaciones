import { TemplateFrame } from "@/components/templates/TemplateFrame";
import { bodyFontSize, titleFontSize, titleLineHeight } from "@/lib/text-fit";
import type { ClosingSlide } from "@/types/carousel";
import type { Asset } from "@/types/carousel";

type Props = { slide: ClosingSlide; brand: string; website: string; index: number; total: number; asset?: Asset };

export function ClosingTemplate({ slide, brand, website, index, total, asset }: Props) {
  const titleSize = titleFontSize(slide.title, "closing");
  return (
    <TemplateFrame slideId={slide.id} variant="closing" templateId={slide.templateId} brand={brand} index={index} total={total} asset={asset}>
      <main className="closing-content" data-overflow-check="closing-content">
        <div className="closing-emblem">K</div>
        <div className="eyebrow">El siguiente paso</div>
        <h1 style={{ fontSize: titleSize, lineHeight: titleLineHeight(titleSize) }}>{slide.title}</h1>
        <p style={{ fontSize: bodyFontSize(slide.body) }}>{slide.body}</p>
        <div className="cta-box"><span>Conversemos</span><strong>{slide.cta}</strong></div>
        <div className="website">{website}</div>
      </main>
    </TemplateFrame>
  );
}
