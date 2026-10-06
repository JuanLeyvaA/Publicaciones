import { movableElement } from "@/lib/templates/movableElement";
import { TemplateFrame } from "@/components/templates/TemplateFrame";
import { editableDirectionCopy, type ArtDirectionId } from "@/lib/templates/artDirection";
import { bodyFontSize, titleFontSize, titleLineHeight } from "@/lib/text-fit";
import type { ContentSlide } from "@/types/carousel";
import type { Asset } from "@/types/carousel";

type Props = { slide: ContentSlide; brand: string; index: number; total: number; asset?: Asset; direction: ArtDirectionId };

export function ContentTemplate({ slide, brand, index, total, asset, direction }: Props) {
  const densityScore = slide.title.length * 1.4 + slide.body.length + slide.highlight.length * 1.2;
  const density = densityScore > 340 ? "text-very-dense" : densityScore > 270 ? "text-dense" : "";
  const titleSize = Math.max(titleFontSize(slide.title, "content") - (density === "text-very-dense" ? 12 : density ? 6 : 0), 42);
  const bodySize = Math.max(bodyFontSize(slide.body) - (density === "text-very-dense" ? 5 : density ? 3 : 0), 22);
  const copy = editableDirectionCopy(direction, slide.appearance);
  return (
    <TemplateFrame slideId={slide.id} variant="content" templateId={slide.templateId} brand={brand} index={index} total={total} asset={asset} fitKey={`${slide.title}:${slide.body}:${slide.highlight}`} direction={direction} appearance={slide.appearance}>
      <main className={`content-layout ${density}`.trim()} data-overflow-check="content-layout">
        <section className="content-copy" data-movable-panel style={{ translate: `${slide.appearance?.panelPosition?.x ?? 0}px ${slide.appearance?.panelPosition?.y ?? 0}px` }}>
          <div className="section-number" {...movableElement(slide.appearance, "number")}>{String(slide.number).padStart(2, "0")}</div>
          <div className="eyebrow" {...movableElement(slide.appearance, "kicker")}>{copy.contentKicker}</div>
          <h1 {...movableElement(slide.appearance, "title")} data-collision-check="title" data-autofit data-autofit-base={titleSize} data-autofit-min="34" style={{ ...movableElement(slide.appearance, "title").style, fontSize: titleSize, lineHeight: titleLineHeight(titleSize) }}>{slide.title}</h1>
          <p {...movableElement(slide.appearance, "body")} data-collision-check="body" data-autofit data-autofit-base={bodySize} data-autofit-min="18" style={{ ...movableElement(slide.appearance, "body").style, fontSize: bodySize }}>{slide.body}</p>
          {slide.highlight && <aside className="highlight-box" {...movableElement(slide.appearance, "highlight")} data-overflow-check="highlight" data-collision-check="highlight">
            {copy.highlightLabel && <span>{copy.highlightLabel}</span>}
            <strong data-autofit data-autofit-min="17">{slide.highlight}</strong>
          </aside>}
        </section>
        {slide.appearance?.showScene !== false && <aside className="visual-panel" aria-label="Composición visual decorativa">
          <span className="visual-index" {...movableElement(slide.appearance, "visual-index")}>{String(slide.number).padStart(2, "0")}</span>
          <div className="visual-orbit" {...movableElement(slide.appearance, "orbit")} aria-hidden="true"><i {...movableElement(slide.appearance, "orbit-one")} /><i {...movableElement(slide.appearance, "orbit-two")} /><i {...movableElement(slide.appearance, "orbit-three")} /></div>
          <div className="visual-card card-one" {...movableElement(slide.appearance, "card-one")}><i /><b>{copy.visualSteps[0]}</b><small>{copy.visualSteps[1]}</small></div>
          <div className="visual-card card-two" {...movableElement(slide.appearance, "card-two")}><i /><b>{copy.visualSteps[2]}</b><small>{copy.visualCaption}</small></div>
          <div className="visual-steps" aria-hidden="true">
            {copy.visualSteps.map((step, stepIndex) => step && <span key={stepIndex} {...movableElement(slide.appearance, `step-${stepIndex}`)}><i>{stepIndex + 1}</i>{step}</span>)}
          </div>
          <small className="visual-caption" {...movableElement(slide.appearance, "caption")}>{copy.visualCaption}</small>
        </aside>}
      </main>
    </TemplateFrame>
  );
}
