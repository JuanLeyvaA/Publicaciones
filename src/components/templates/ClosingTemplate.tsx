import { TemplateFrame } from "@/components/templates/TemplateFrame";
import { bodyFontSize, titleFontSize, titleLineHeight } from "@/lib/text-fit";
import type { ClosingSlide } from "@/types/carousel";
import type { Asset } from "@/types/carousel";

type Props = { slide: ClosingSlide; brand: string; website: string; index: number; total: number; asset?: Asset };

export function ClosingTemplate({ slide, brand, website, index, total, asset }: Props) {
  const dense = slide.title.length + slide.body.length + slide.cta.length > 260;
  const titleSize = Math.max(titleFontSize(slide.title, "closing") - (dense ? 6 : 0), 44);
  const bodySize = Math.max(bodyFontSize(slide.body) - (dense ? 3 : 0), 22);
  return (
    <TemplateFrame slideId={slide.id} variant="closing" templateId={slide.templateId} brand={brand} index={index} total={total} asset={asset} fitKey={`${slide.title}:${slide.body}:${slide.cta}`}>
      <main className={`closing-content${dense ? " text-dense" : ""}`} data-overflow-check="closing-content">
        <div className="closing-emblem">K</div>
        <div className="eyebrow">El siguiente paso</div>
        <h1 data-collision-check="title" data-autofit data-autofit-base={titleSize} data-autofit-min="36" style={{ fontSize: titleSize, lineHeight: titleLineHeight(titleSize) }}>{slide.title}</h1>
        <p data-collision-check="body" data-autofit data-autofit-base={bodySize} data-autofit-min="18" style={{ fontSize: bodySize }}>{slide.body}</p>
        <div className="cta-box" data-collision-check="cta"><span>Conversemos</span><strong data-autofit data-autofit-min="17">{slide.cta}</strong></div>
        <div className="website">{website}</div>
      </main>
    </TemplateFrame>
  );
}
