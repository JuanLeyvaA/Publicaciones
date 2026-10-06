import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResizableTextPreview } from "@/components/preview/ResizableTextPreview";
import { movableElement } from "@/lib/templates/movableElement";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import { demoProject } from "@/data/demo-project";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

function setup() {
  vi.stubGlobal("PointerEvent", MouseEvent);
  const onResize = vi.fn();
  const view = render(<ResizableTextPreview enabled onResize={onResize}><article data-canvas-width="1080"><div data-safe-area><p data-resizable-text="body" style={{ color: "red" }}>Texto</p><img alt="Fondo" /></div></article></ResizableTextPreview>);
  const host = view.container.firstElementChild as HTMLElement;
  host.setPointerCapture = vi.fn();
  host.hasPointerCapture = () => false;
  view.container.querySelector("article")!.getBoundingClientRect = () => ({ width: 540 } as DOMRect);
  view.container.querySelector("[data-safe-area]")!.getBoundingClientRect = () => ({ right: 500, bottom: 650 } as DOMRect);
  const text = view.getByText("Texto");
  text.getBoundingClientRect = () => ({ left: 100, top: 100, right: 300, bottom: 200, width: 200, height: 100 } as DOMRect);
  return { ...view, text, onResize };
}

describe("tamaño de cuadros de texto", () => {
  it("ensancha y alarga compensando la escala sin mover la imagen", () => {
    const view = setup();
    fireEvent.pointerDown(view.text, { button: 0, clientX: 300, clientY: 200 });
    fireEvent.pointerMove(view.text, { clientX: 350, clientY: 225 });
    expect(view.text.style.width).toBe("500px");
    expect(view.text.style.height).toBe("250px");
    expect(view.getByAltText("Fondo").getAttribute("style")).toBe(null);
    fireEvent.pointerUp(view.text);
    expect(view.onResize).toHaveBeenCalledWith("body", { width: 500, height: 250 });
  });

  it("restaura el tamaño anterior si se cancela", () => {
    const view = setup();
    fireEvent.pointerDown(view.text, { button: 0, clientX: 300, clientY: 200 });
    fireEvent.pointerMove(view.text, { clientX: 350, clientY: 225 });
    fireEvent.pointerCancel(view.text);
    expect(view.text.style.width).toBe("");
    expect(view.text.style.color).toBe("red");
    expect(view.onResize).not.toHaveBeenCalled();
  });

  it("solo inicia desde la esquina", () => {
    const view = setup();
    fireEvent.pointerDown(view.text, { button: 0, clientX: 150, clientY: 150 });
    fireEvent.pointerMove(view.text, { clientX: 350, clientY: 225 });
    fireEvent.pointerUp(view.text);
    expect(view.onResize).not.toHaveBeenCalled();
  });

  it("conserva las medidas para el render de descarga", () => {
    const project = structuredClone(demoProject);
    project.slides[0].appearance = { textSizes: { title: { width: 800, height: 300 } } };
    const saved = carouselProjectSchema.parse(project);
    expect(movableElement(saved.slides[0].appearance, "title").style).toMatchObject({ width: 800, height: 300 });
    expect(movableElement({ textSizes: {} }, "title").style.width).toBeUndefined();
  });
});
