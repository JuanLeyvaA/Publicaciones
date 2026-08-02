import { TemplateFrame } from "@/components/templates/TemplateFrame";
import { titleFontSize, titleLineHeight } from "@/lib/text-fit";
import type { CoverSlide } from "@/types/carousel";
import type { Asset } from "@/types/carousel";

type Props = { slide: CoverSlide; brand: string; index: number; total: number; asset?: Asset };

export function CoverTemplate({ slide, brand, index, total, asset }: Props) {
  const dense = slide.title.length + slide.subtitle.length > 180;
  const size = Math.max(titleFontSize(slide.title, "cover") - (dense ? 6 : 0), 44);
  return (
    <TemplateFrame slideId={slide.id} variant="cover" templateId={slide.templateId} brand={brand} index={index} total={total} asset={asset} fitKey={`${slide.title}:${slide.subtitle}`}>
      <main className={`cover-content${dense ? " text-dense" : ""}`} data-overflow-check="cover-content">
        <div className="eyebrow">Ideas que mueven empresas</div>
        <h1 data-collision-check="title" data-autofit data-autofit-base={size} data-autofit-min="36" style={{ fontSize: size, lineHeight: titleLineHeight(size) }}>{slide.title}</h1>
        <p data-collision-check="subtitle" data-autofit data-autofit-min="20" className="cover-subtitle">{slide.subtitle}</p>
        <div className="topic-pill"><span>✦</span> Guía práctica</div>
      </main>
    </TemplateFrame>
  );
}
