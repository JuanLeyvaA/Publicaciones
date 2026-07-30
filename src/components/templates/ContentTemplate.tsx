import { TemplateFrame } from "@/components/templates/TemplateFrame";
import { bodyFontSize, titleFontSize, titleLineHeight } from "@/lib/text-fit";
import type { ContentSlide } from "@/types/carousel";
import type { Asset } from "@/types/carousel";

type Props = { slide: ContentSlide; brand: string; index: number; total: number; asset?: Asset };

export function ContentTemplate({ slide, brand, index, total, asset }: Props) {
  const densityScore = slide.title.length * 1.4 + slide.body.length + slide.highlight.length * 1.2;
  const density = densityScore > 340 ? "text-very-dense" : densityScore > 270 ? "text-dense" : "";
  const titleSize = Math.max(titleFontSize(slide.title, "content") - (density === "text-very-dense" ? 12 : density ? 6 : 0), 42);
  const bodySize = Math.max(bodyFontSize(slide.body) - (density === "text-very-dense" ? 5 : density ? 3 : 0), 22);
  return (
    <TemplateFrame slideId={slide.id} variant="content" templateId={slide.templateId} brand={brand} index={index} total={total} asset={asset}>
      <main className={`content-layout ${density}`.trim()} data-overflow-check="content-layout">
        <section className="content-copy">
          <div className="section-number">{String(slide.number).padStart(2, "0")}</div>
          <div className="eyebrow">Proceso clave</div>
          <h1 data-collision-check="title" style={{ fontSize: titleSize, lineHeight: titleLineHeight(titleSize) }}>{slide.title}</h1>
          <p data-collision-check="body" style={{ fontSize: bodySize }}>{slide.body}</p>
          <aside className="highlight-box" data-overflow-check="highlight" data-collision-check="highlight">
            <span>Idea clave</span>
            <strong>{slide.highlight}</strong>
          </aside>
        </section>
        <aside className="visual-panel" aria-label="Composición visual decorativa">
          <span className="visual-index">{String(slide.number).padStart(2, "0")}</span>
          <div className="visual-card card-one"><i /><b>Flujo activo</b><small>Automatización</small></div>
          <div className="visual-card card-two"><i /><b>+38%</b><small>Eficiencia</small></div>
        </aside>
      </main>
    </TemplateFrame>
  );
}
