import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { demoProject } from "@/data/demo-project";
import { ContentTemplate } from "@/components/templates/ContentTemplate";

describe("textos editables de plantilla", () => {
  it("reemplaza Fuera de cuadro y aplica los controles de visibilidad", () => {
    const slide = demoProject.slides.find((item) => item.type === "content")!;
    if (slide.type !== "content") throw new Error("Falta página de contenido");
    const html = renderToStaticMarkup(<ContentTemplate slide={{ ...slide, appearance: { showHeader: false, showFooter: false, showAsset: false, texts: { highlightLabel: "Mi etiqueta" } } }} brand="Kalliom" index={1} total={5} direction="photo-essay" />);
    expect(html).toContain("Mi etiqueta");
    expect(html).not.toContain("Fuera de cuadro");
    expect(html).not.toContain('class="slide-header"');
    expect(html).not.toContain('class="slide-footer"');
  });

  it("elimina una etiqueta vacía sin recuperar la frase predeterminada", () => {
    const slide = demoProject.slides.find((item) => item.type === "content")!;
    if (slide.type !== "content") throw new Error("Falta página de contenido");
    const html = renderToStaticMarkup(<ContentTemplate slide={{ ...slide, appearance: { texts: { highlightLabel: "" } } }} brand="Kalliom" index={1} total={5} direction="photo-essay" />);
    expect(html).not.toContain("Fuera de cuadro");
    expect(html).toContain(slide.highlight);
  });
});
