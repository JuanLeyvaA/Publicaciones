import { cleanup, fireEvent, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { demoProject } from "@/data/demo-project";
import { getProjectAsset } from "@/lib/assets/catalog";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import { CoverTemplate } from "@/components/templates/CoverTemplate";
import { DraggablePanelPreview } from "@/components/preview/DraggablePanelPreview";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("edición de fotos", () => {
  it("conserva los ajustes al validar y renderizar la descarga", () => {
    const project = structuredClone(demoProject);
    project.referenceImageUrls = ["/uploads/foto.jpg"];
    project.slides[0].assetId = "reference-1";
    project.slides[0].appearance = { elementPositions: { asset: { x: -120, y: 60 } }, assetEditing: { scale: 1.8, rotation: 15, opacity: 1, fit: "contain", fullPhoto: true } };
    const saved = carouselProjectSchema.parse(project);
    const slide = saved.slides[0];
    if (slide.type !== "cover") throw new Error("Falta portada");
    const html = renderToStaticMarkup(<CoverTemplate slide={slide} asset={getProjectAsset(saved, slide.assetId)} brand="Kalliom" index={0} total={5} direction="photo-essay" />);
    expect(html).toContain("translate:-120px 60px");
    expect(html).toContain("--asset-scale:1.8");
    expect(html).toContain("--asset-rotation:15deg");
    expect(html).toContain("opacity:1");
    expect(html).toContain('data-asset-opacity="1"');
    expect(html).toContain("--asset-opacity:1");
    expect(html).toContain("object-fit:contain");
    expect(html).toContain("clip-path:none");
    expect(html).toContain("mask-image:none");
  });

  it("mueve la foto a escala sin mover el panel y permite cancelar", () => {
    vi.stubGlobal("PointerEvent", MouseEvent);
    const onMoveElement = vi.fn();
    const onMove = vi.fn();
    const view = render(<DraggablePanelPreview mode="image" position={{ x: 0, y: 0 }} elementPositions={{ asset: { x: 10, y: 20 } }} onMove={onMove} onMoveElement={onMoveElement}><article data-canvas-width="1080"><div data-movable-element="asset">Foto</div><div data-safe-area><section data-movable-panel>Texto</section></div></article></DraggablePanelPreview>);
    const host = view.container.firstElementChild as HTMLElement;
    host.setPointerCapture = vi.fn();
    host.hasPointerCapture = () => false;
    view.container.querySelector("article")!.getBoundingClientRect = () => ({ width: 540 } as DOMRect);
    const photo = view.getByText("Foto");
    fireEvent.pointerDown(photo, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(photo, { clientX: 150, clientY: 125 });
    expect(photo.style.translate).toBe("110px 70px");
    fireEvent.pointerUp(photo);
    expect(onMoveElement).toHaveBeenCalledWith("asset", { x: 110, y: 70 });
    expect(onMove).not.toHaveBeenCalled();
    fireEvent.pointerDown(photo, { button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(photo, { clientX: 200, clientY: 200 });
    fireEvent.pointerCancel(photo);
    expect(photo.style.translate).toBe("10px 20px");
    expect(onMoveElement).toHaveBeenCalledTimes(1);
  });
});
