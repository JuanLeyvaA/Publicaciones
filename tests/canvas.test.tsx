import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SlideCanvas } from "@/components/slides/SlideCanvas";
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/constants";

describe("SlideCanvas", () => {
  it("mantiene el canvas fijo de 1080 × 1350", () => {
    const html = renderToStaticMarkup(<SlideCanvas slideId="test"><p>Contenido</p></SlideCanvas>);
    expect(SLIDE_WIDTH).toBe(1080);
    expect(SLIDE_HEIGHT).toBe(1350);
    expect(html).toContain("width:1080px");
    expect(html).toContain("height:1350px");
    expect(html).toContain("min-width:1080px");
    expect(html).toContain("max-height:1350px");
  });
});
