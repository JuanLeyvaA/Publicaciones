import { fireEvent, render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DraggablePanelPreview } from "@/components/preview/DraggablePanelPreview";
import { demoProject } from "@/data/demo-project";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import { ContentTemplate } from "@/components/templates/ContentTemplate";
import { renderToStaticMarkup } from "react-dom/server";

afterEach(cleanup);

function setup(mode: "panel" | "elements" = "panel") {
  vi.stubGlobal("PointerEvent", MouseEvent);
  const onMove = vi.fn();
  const onMoveElement = vi.fn();
  const view = render(<DraggablePanelPreview mode={mode} elementPositions={{ title: { x: 10, y: 20 } }} onMoveElement={onMoveElement} position={{ x: 0, y: 0 }} onMove={onMove}><article data-canvas-width="1080"><div data-testid="image" /><div data-safe-area><section data-movable-panel><p data-movable-element="title">Información</p></section></div></article></DraggablePanelPreview>);
  const host = view.container.firstElementChild as HTMLElement;
  host.setPointerCapture = vi.fn();
  host.hasPointerCapture = () => false;
  const canvas = view.container.querySelector("article")!;
  const safe = view.container.querySelector("[data-safe-area]")!;
  const panel = view.container.querySelector("section")!;
  canvas.getBoundingClientRect = () => ({ width: 540 } as DOMRect);
  safe.getBoundingClientRect = () => ({ left: 20, top: 20, right: 520, bottom: 655 } as DOMRect);
  panel.getBoundingClientRect = () => ({ left: 100, top: 100, right: 400, bottom: 400 } as DOMRect);
  view.getByText("Información").getBoundingClientRect = panel.getBoundingClientRect;
  return { ...view, panel, onMove, onMoveElement };
}

describe("arrastre independiente del panel", () => {
  it("mueve el elemento elegido sin mover su panel ni la imagen", () => {
    const view = setup("elements");
    const title = view.getByText("Información");
    fireEvent.pointerDown(title, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(title, { clientX: 125, clientY: 140 });
    expect(title.style.translate).toBe("60px 100px");
    expect(view.panel.style.translate).toBe("");
    expect(view.getByTestId("image").style.translate).toBe("");
    fireEvent.pointerUp(title);
    expect(view.onMoveElement).toHaveBeenCalledWith("title", { x: 60, y: 100 });
    expect(view.onMove).not.toHaveBeenCalled();
  });
  it("compensa la escala y mantiene fija la imagen", () => {
    const view = setup();
    fireEvent.pointerDown(view.getByText("Información"), { button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(view.panel, { clientX: 125, clientY: 140 });
    expect(view.panel.style.translate).toBe("50px 80px");
    expect(view.getByTestId("image").style.translate).toBe("");
    fireEvent.pointerUp(view.panel);
    expect(view.onMove).toHaveBeenCalledWith({ x: 50, y: 80 });
  });

  it("limita el movimiento al área segura y permite cancelar", () => {
    const view = setup();
    fireEvent.pointerDown(view.panel, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(view.panel, { clientX: 2000, clientY: -2000 });
    expect(view.panel.style.translate).toBe("240px -160px");
    fireEvent.pointerCancel(view.panel);
    expect(view.panel.style.translate).toBe("0px 0px");
    expect(view.onMove).not.toHaveBeenCalled();
  });

  it("no inicia un arrastre desde la imagen", () => {
    const view = setup();
    fireEvent.pointerDown(view.getByTestId("image"), { button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(view.getByTestId("image"), { clientX: 200, clientY: 200 });
    fireEvent.pointerUp(view.getByTestId("image"));
    expect(view.onMove).not.toHaveBeenCalled();
  });

  it("conserva la posición validada en el render de descarga", () => {
    const project = structuredClone(demoProject);
    const slide = project.slides.find((item) => item.type === "content")!;
    slide.appearance = { panelPosition: { x: 50, y: -30 }, elementPositions: { title: { x: 12, y: 25 }, "card-one": { x: -40, y: 20 } } };
    const saved = carouselProjectSchema.parse(project).slides.find((item) => item.type === "content")!;
    if (saved.type !== "content") throw new Error("Falta contenido");
    const html = renderToStaticMarkup(<ContentTemplate slide={saved} brand="Kalliom" index={1} total={5} direction="photo-essay" />);
    expect(html).toContain('data-movable-panel="true" style="translate:50px -30px"');
    expect(saved.appearance?.panelPosition).toEqual({ x: 50, y: -30 });
    expect(saved.appearance?.elementPositions?.title).toEqual({ x: 12, y: 25 });
    expect(html).toContain("translate:12px 25px");
    expect(html).toContain('data-movable-element="card-one" data-resizable-text="card-one" style="translate:-40px 20px"');
  });
});
