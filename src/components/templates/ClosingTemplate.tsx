import { movableElement } from "@/lib/templates/movableElement";
import { TemplateFrame } from "@/components/templates/TemplateFrame";
import { editableDirectionCopy, type ArtDirectionId } from "@/lib/templates/artDirection";
import { bodyFontSize, titleFontSize, titleLineHeight } from "@/lib/text-fit";
import type { ClosingSlide } from "@/types/carousel";
import type { Asset } from "@/types/carousel";

type Props = { slide: ClosingSlide; brand: string; website: string; index: number; total: number; asset?: Asset; direction: ArtDirectionId };

export function ClosingTemplate({ slide, brand, website, index, total, asset, direction }: Props) {
  const dense = slide.title.length + slide.body.length + slide.cta.length > 260;
  const titleSize = Math.max(titleFontSize(slide.title, "closing") - (dense ? 6 : 0), 44);
  const bodySize = Math.max(bodyFontSize(slide.body) - (dense ? 3 : 0), 22);
  const copy = editableDirectionCopy(direction, slide.appearance);
  return (
    <TemplateFrame slideId={slide.id} variant="closing" templateId={slide.templateId} brand={brand} index={index} total={total} asset={asset} fitKey={`${slide.title}:${slide.body}:${slide.cta}`} direction={direction} appearance={slide.appearance}>
      {slide.appearance?.showScene !== false && <div className="closing-scenography" aria-hidden="true"><span {...movableElement(slide.appearance, "display-word")}>{copy.displayWord}</span><i {...movableElement(slide.appearance, "scene-one")} /><i {...movableElement(slide.appearance, "scene-two")} /><i {...movableElement(slide.appearance, "scene-three")} /></div>}
      <main className={`closing-content${dense ? " text-dense" : ""}`} data-overflow-check="closing-content" data-movable-panel style={{ translate: `${slide.appearance?.panelPosition?.x ?? 0}px ${slide.appearance?.panelPosition?.y ?? 0}px` }}>
        <div className="closing-emblem" {...movableElement(slide.appearance, "emblem")}>K</div>
        {copy.closingKicker && <div className="eyebrow" {...movableElement(slide.appearance, "kicker")}>{copy.closingKicker}</div>}
        <h1 {...movableElement(slide.appearance, "title")} data-collision-check="title" data-autofit data-autofit-base={titleSize} data-autofit-min="36" style={{ ...movableElement(slide.appearance, "title").style, fontSize: titleSize, lineHeight: titleLineHeight(titleSize) }}>{slide.title}</h1>
        <p {...movableElement(slide.appearance, "body")} data-collision-check="body" data-autofit data-autofit-base={bodySize} data-autofit-min="18" style={{ ...movableElement(slide.appearance, "body").style, fontSize: bodySize }}>{slide.body}</p>
        {slide.cta && <div className="cta-box" {...movableElement(slide.appearance, "cta")} data-collision-check="cta">{copy.ctaLabel && <span>{copy.ctaLabel}</span>}<strong data-autofit data-autofit-min="17">{slide.cta}</strong></div>}
        <div className="closing-signature" {...movableElement(slide.appearance, "signature")}>{copy.signature}</div>
        <div className="website" {...movableElement(slide.appearance, "website")}>{website}</div>
      </main>
    </TemplateFrame>
  );
}
