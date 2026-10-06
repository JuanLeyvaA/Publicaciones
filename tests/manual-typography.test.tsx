import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SlideAutoFit } from "@/components/templates/SlideAutoFit";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import { demoProject } from "@/data/demo-project";

beforeEach(() => {
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0));
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 } as DOMRect);
});

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

function Scene({ manual, fitKey, fonts }: { manual: boolean; fitKey: string; fonts?: Record<string, number> }) {
  return <article id="slide-canvas"><div data-safe-area><h1 data-movable-element="title" data-autofit data-autofit-base="80" data-autofit-min="20" data-collision-check="title" style={{ fontSize: 80 }}>Título</h1><p data-movable-element="body" data-autofit data-autofit-base="40" data-autofit-min="18" data-collision-check="body" style={{ fontSize: 40 }}>Cuerpo</p><SlideAutoFit fitKey={fitKey} manualLayout={manual} fontSizes={fonts} /></div></article>;
}

describe("tipografía en composición manual", () => {
  it("conserva la letra guardada incluso si los cuadros se cruzan", async () => {
    const fonts = { title: 64, body: 32 };
    const view = render(<Scene manual fitKey="posición inicial" fonts={fonts} />);
    await waitFor(() => expect(view.container.querySelector("article")?.dataset.layoutReady).toBe("ready"));
    expect(view.getByText("Título").style.fontSize).toBe("64px");
    view.rerender(<Scene manual fitKey="cuadro agrandado" fonts={fonts} />);
    await waitFor(() => expect(view.container.querySelector("article")?.dataset.layoutReady).toBe("ready"));
    expect(view.getByText("Título").style.fontSize).toBe("64px");
    expect(view.getByText("Cuerpo").style.fontSize).toBe("32px");
  });

  it("conserva la letra existente en composiciones anteriores sin tamaños guardados", async () => {
    const view = render(<Scene manual fitKey="manual anterior" />);
    await waitFor(() => expect(view.container.querySelector("article")?.dataset.layoutReady).toBe("ready"));
    expect(view.getByText("Título").style.fontSize).toBe("80px");
  });

  it("sigue ajustando las composiciones automáticas", async () => {
    const view = render(<Scene manual={false} fitKey="automático" />);
    await waitFor(() => expect(view.container.querySelector("article")?.dataset.layoutReady).toBe("exhausted"));
    expect(Number.parseFloat(view.getByText("Título").style.fontSize)).toBeLessThan(80);
  });

  it("conserva los tamaños de letra al validar para guardar y exportar", () => {
    const project = structuredClone(demoProject);
    project.slides[0].appearance = { textSizes: { title: { width: 800, height: 300 } }, fontSizes: { title: 64, subtitle: 28 } };
    expect(carouselProjectSchema.parse(project).slides[0].appearance?.fontSizes).toEqual({ title: 64, subtitle: 28 });
  });
});
