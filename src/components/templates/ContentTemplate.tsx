import { TemplateFrame } from "@/components/templates/TemplateFrame";
import { bodyFontSize, titleFontSize, titleLineHeight } from "@/lib/text-fit";
import type { ContentSlide } from "@/types/carousel";
import type { Asset } from "@/types/carousel";

type Props = { slide: ContentSlide; brand: string; index: number; total: number; asset?: Asset };

export function ContentTemplate({ slide, brand, index, total, asset }: Props) {
  const titleSize = titleFontSize(slide.title, "content");
  return (
    <TemplateFrame slideId={slide.id} variant="content" brand={brand} index={index} total={total} asset={asset}>
      <main className="content-layout" data-overflow-check="content-layout">
        <section className="content-copy">
          <div className="section-number">{String(slide.number).padStart(2, "0")}</div>
          <div className="eyebrow">Proceso clave</div>
          <h1 style={{ fontSize: titleSize, lineHeight: titleLineHeight(titleSize) }}>{slide.title}</h1>
          <p style={{ fontSize: bodyFontSize(slide.body) }}>{slide.body}</p>
          <aside className="highlight-box" data-overflow-check="highlight">
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
