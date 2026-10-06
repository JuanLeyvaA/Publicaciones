import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SelectableElements } from "@/components/preview/SelectableElements";
import { movableElement } from "@/lib/templates/movableElement";
import { carouselProjectSchema } from "@/lib/validation/project-schema";
import { demoProject } from "@/data/demo-project";
import { ContentTemplate } from "@/components/templates/ContentTemplate";
import { renderToStaticMarkup } from "react-dom/server";
import { TemplateFrame } from "@/components/templates/TemplateFrame";

afterEach(cleanup);

describe("seleccionar y borrar elementos", () => {
  it("selecciona y borra una capa de fondo desde la lista aunque esté detrás del texto", () => {
    const onDelete = vi.fn();
    const view = render(<SelectableElements hiddenElements={[]} onDelete={onDelete} onRestore={vi.fn()}><div data-selectable-element="background" style={{ position: "absolute", zIndex: -3 }} /><h1 data-movable-element="title">Título encima</h1></SelectableElements>);
    fireEvent.change(view.getByLabelText("Seleccionar capa"), { target: { value: "background" } });
    fireEvent.click(view.getByText("Borrar elemento"));
    expect(onDelete).toHaveBeenCalledWith("background");
  });

  it("conserva el borrado del fondo y su textura en el render de descarga", () => {
    const html = renderToStaticMarkup(<TemplateFrame slideId="cover" variant="cover" templateId="cover" brand="Kalliom" index={0} total={5} fitKey="test" direction="photo-essay" appearance={{ hiddenElements: ["background", "texture", "orb-one"] }}><p>Texto conservado</p></TemplateFrame>);
    expect(html).toContain("background-removed");
    expect(html).toContain('data-selectable-element="background" data-element-hidden="true"');
    expect(html).toContain('data-selectable-element="texture" data-element-hidden="true"');
    expect(html).toContain("Texto conservado");
  });
  it("selecciona un elemento anidado y lo borra con el botón", () => {
    const onDelete = vi.fn();
    const view = render(<SelectableElements hiddenElements={[]} onDelete={onDelete} onRestore={vi.fn()}><section data-movable-element="card-one"><b>Tarjeta</b></section></SelectableElements>);
    fireEvent.pointerDown(view.getByText("Tarjeta"));
    expect(view.getByText("Tarjeta").parentElement?.dataset.selectedElement).toBe("true");
    fireEvent.click(view.getByText("Borrar elemento"));
    expect(onDelete).toHaveBeenCalledWith("card-one");
  });

  it("permite borrar con Suprimir y restaurar lo borrado", () => {
    const onDelete = vi.fn(), onRestore = vi.fn();
    const view = render(<SelectableElements hiddenElements={["body"]} onDelete={onDelete} onRestore={onRestore}><h1 data-movable-element="title">Título de prueba</h1></SelectableElements>);
    fireEvent.pointerDown(view.getByText("Título de prueba"));
    fireEvent.keyDown(document.activeElement!, { key: "Delete" });
    expect(onDelete).toHaveBeenCalledWith("title");
    fireEvent.click(view.getByText("Restaurar Cuerpo de texto"));
    expect(onRestore).toHaveBeenCalledWith("body");
  });

  it("conserva el borrado al guardar y renderizar, y permite restaurarlo", () => {
    const project = structuredClone(demoProject);
    const slide = project.slides.find((item) => item.type === "content")!;
    slide.appearance = { hiddenElements: ["title", "highlight", "card-one"] };
    const saved = carouselProjectSchema.parse(project).slides.find((item) => item.type === "content")!;
    if (saved.type !== "content") throw new Error("Falta contenido");
    expect(saved.appearance?.hiddenElements).toEqual(["title", "highlight", "card-one"]);
    const html = renderToStaticMarkup(<ContentTemplate slide={saved} brand="Kalliom" index={1} total={5} direction="photo-essay" />);
    expect(html).toContain('data-element-hidden="true"');
    expect(movableElement(saved.appearance, "title").style.display).toBe("none");
    expect(movableElement({ hiddenElements: [] }, "title").style.display).toBeUndefined();
  });
});
