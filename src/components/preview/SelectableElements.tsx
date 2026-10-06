"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

const labels: Record<string, string> = { title: "Título", body: "Cuerpo de texto", subtitle: "Subtítulo", kicker: "Etiqueta", highlight: "Recuadro destacado", cta: "Llamada a la acción", badge: "Insignia", signature: "Firma", website: "Sitio web", "card-one": "Tarjeta 1", "card-two": "Tarjeta 2", orbit: "Figura circular", "display-word": "Palabra decorativa", asset: "Imagen", header: "Cabecera", footer: "Pie de página" };
Object.assign(labels, { background: "Fondo", texture: "Textura del fondo", "orb-one": "Luz de fondo 1", "orb-two": "Luz de fondo 2", "decor-one": "Figura de fondo 1", "decor-two": "Figura de fondo 2", "decor-three": "Figura de fondo 3", frame: "Marco decorativo" });

export function SelectableElements({ children, hiddenElements, onDelete, onRestore }: { children: ReactNode; hiddenElements: string[]; onDelete: (id: string) => void; onRestore: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [layers, setLayers] = useState<string[]>([]);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const available = new Set<string>();
    host.current?.querySelectorAll<HTMLElement>("[data-movable-element], [data-selectable-element]").forEach((element) => {
      const id = element.dataset.movableElement ?? element.dataset.selectableElement;
      if (id && !element.closest('[data-element-hidden="true"]') && getComputedStyle(element).display !== "none") available.add(id);
      if ((element.dataset.movableElement ?? element.dataset.selectableElement) === selected) element.dataset.selectedElement = "true";
      else delete element.dataset.selectedElement;
    });
    setLayers((current) => current.join("|") === [...available].join("|") ? current : [...available]);
  }, [selected, children]);

  function removeSelected() {
    if (!selected) return;
    onDelete(selected);
    setSelected(null);
  }

  return <div className="selectable-elements">
    <div className="element-selection-toolbar">
      <span aria-live="polite">{selected ? `Seleccionado: ${labels[selected] ?? "Elemento decorativo"}` : "Haz clic en un elemento para seleccionarlo"}</span>
      <button type="button" className="secondary-button" disabled={!selected} onClick={removeSelected}>Borrar elemento</button>
      <label className="editor-field layer-selector"><span>Seleccionar capa, incluido el fondo</span><select aria-label="Seleccionar capa" value={selected ?? ""} onChange={(event) => setSelected(event.target.value || null)}><option value="">Selecciona un elemento</option>{layers.map((id) => <option value={id} key={id}>{labels[id] ?? id}</option>)}</select></label>
      {hiddenElements.length > 0 && <details><summary>Elementos borrados ({hiddenElements.length})</summary>{hiddenElements.map((id) => <button type="button" className="secondary-button" key={id} onClick={() => onRestore(id)}>Restaurar {labels[id] ?? id}</button>)}</details>}
    </div>
    <div ref={host} tabIndex={0} aria-label="Vista previa: selecciona un elemento y pulsa Suprimir para borrarlo" onPointerDownCapture={(event) => {
      const element = (event.target as HTMLElement).closest<HTMLElement>("[data-movable-element], [data-selectable-element]");
      setSelected(element?.dataset.movableElement ?? element?.dataset.selectableElement ?? null);
      event.currentTarget.focus({ preventScroll: true });
    }} onKeyDown={(event) => {
      if (event.target !== event.currentTarget || !selected || (event.key !== "Delete" && event.key !== "Backspace")) return;
      event.preventDefault();
      removeSelected();
    }}>{children}</div>
  </div>;
}
