import { movableElement } from "@/lib/templates/movableElement";
import { TemplateFrame } from "@/components/templates/TemplateFrame";
import { editableDirectionCopy, type ArtDirectionId } from "@/lib/templates/artDirection";
import { titleFontSize, titleLineHeight } from "@/lib/text-fit";
import type { CoverSlide } from "@/types/carousel";
import type { Asset } from "@/types/carousel";

type Props = { slide: CoverSlide; brand: string; index: number; total: number; asset?: Asset; direction: ArtDirectionId };

export function CoverTemplate({ slide, brand, index, total, asset, direction }: Props) {
  const dense = slide.title.length + slide.subtitle.length > 180;
  const size = Math.max(titleFontSize(slide.title, "cover") - (dense ? 6 : 0), 44);
  const copy = editableDirectionCopy(direction, slide.appearance);
  return (
    <TemplateFrame slideId={slide.id} variant="cover" templateId={slide.templateId} brand={brand} index={index} total={total} asset={asset} fitKey={`${slide.title}:${slide.subtitle}`} direction={direction} appearance={slide.appearance}>
      {slide.appearance?.showScene !== false && <div className="cover-scenography" aria-hidden="true">
        <strong {...movableElement(slide.appearance, "display-word")}>{copy.displayWord}</strong>
        <span className="scene-mark mark-one" {...movableElement(slide.appearance, "mark-one")}>✦</span>
        <span className="scene-mark mark-two" {...movableElement(slide.appearance, "mark-two")}>+</span>
        <span className="scene-mark mark-three" {...movableElement(slide.appearance, "mark-three")}>●</span>
        <small {...movableElement(slide.appearance, "scene-signature")}>{copy.signature}</small>
      </div>}
      <main className={`cover-content${dense ? " text-dense" : ""}`} data-overflow-check="cover-content" data-movable-panel style={{ translate: `${slide.appearance?.panelPosition?.x ?? 0}px ${slide.appearance?.panelPosition?.y ?? 0}px` }}>
        {copy.coverKicker && <div className="eyebrow" {...movableElement(slide.appearance, "kicker")}>{copy.coverKicker}</div>}
        <h1 {...movableElement(slide.appearance, "title")} data-collision-check="title" data-autofit data-autofit-base={size} data-autofit-min="36" style={{ ...movableElement(slide.appearance, "title").style, fontSize: size, lineHeight: titleLineHeight(size) }}>{slide.title}</h1>
        <p {...movableElement(slide.appearance, "subtitle")} data-collision-check="subtitle" data-autofit data-autofit-min="20" className="cover-subtitle">{slide.subtitle}</p>
        {copy.coverBadge && <div className="topic-pill" {...movableElement(slide.appearance, "badge")}><span>✦</span> {copy.coverBadge}</div>}
      </main>
    </TemplateFrame>
  );
}
