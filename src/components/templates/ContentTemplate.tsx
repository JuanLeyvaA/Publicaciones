import { TemplateFrame } from "@/components/templates/TemplateFrame";
import { artDirectionCopy, type ArtDirectionId } from "@/lib/templates/artDirection";
import { bodyFontSize, titleFontSize, titleLineHeight } from "@/lib/text-fit";
import type { ContentSlide } from "@/types/carousel";
import type { Asset } from "@/types/carousel";

type Props = { slide: ContentSlide; brand: string; index: number; total: number; asset?: Asset; direction: ArtDirectionId };

export function ContentTemplate({ slide, brand, index, total, asset, direction }: Props) {
  const densityScore = slide.title.length * 1.4 + slide.body.length + slide.highlight.length * 1.2;
  const density = densityScore > 340 ? "text-very-dense" : densityScore > 270 ? "text-dense" : "";
  const titleSize = Math.max(titleFontSize(slide.title, "content") - (density === "text-very-dense" ? 12 : density ? 6 : 0), 42);
  const bodySize = Math.max(bodyFontSize(slide.body) - (density === "text-very-dense" ? 5 : density ? 3 : 0), 22);
  const copy = artDirectionCopy[direction];
  return (
    <TemplateFrame slideId={slide.id} variant="content" templateId={slide.templateId} brand={brand} index={index} total={total} asset={asset} fitKey={`${slide.title}:${slide.body}:${slide.highlight}`} direction={direction}>
      <main className={`content-layout ${density}`.trim()} data-overflow-check="content-layout">
        <section className="content-copy">
          <div className="section-number">{String(slide.number).padStart(2, "0")}</div>
          <div className="eyebrow">{copy.contentKicker}</div>
          <h1 data-collision-check="title" data-autofit data-autofit-base={titleSize} data-autofit-min="34" style={{ fontSize: titleSize, lineHeight: titleLineHeight(titleSize) }}>{slide.title}</h1>
          <p data-collision-check="body" data-autofit data-autofit-base={bodySize} data-autofit-min="18" style={{ fontSize: bodySize }}>{slide.body}</p>
          <aside className="highlight-box" data-overflow-check="highlight" data-collision-check="highlight">
            <span>{copy.highlightLabel}</span>
            <strong data-autofit data-autofit-min="17">{slide.highlight}</strong>
          </aside>
        </section>
        <aside className="visual-panel" aria-label="Composición visual decorativa">
          <span className="visual-index">{String(slide.number).padStart(2, "0")}</span>
          <div className="visual-orbit" aria-hidden="true"><i /><i /><i /></div>
          <div className="visual-card card-one"><i /><b>{copy.visualSteps[0]}</b><small>{copy.visualSteps[1]}</small></div>
          <div className="visual-card card-two"><i /><b>{copy.visualSteps[2]}</b><small>{copy.visualCaption}</small></div>
          <div className="visual-steps" aria-hidden="true">
            {copy.visualSteps.map((step, stepIndex) => <span key={step}><i>{stepIndex + 1}</i>{step}</span>)}
          </div>
          <small className="visual-caption">{copy.visualCaption}</small>
        </aside>
      </main>
    </TemplateFrame>
  );
}
