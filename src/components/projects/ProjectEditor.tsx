"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AssetPicker } from "@/components/assets/AssetPicker";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { DraggablePanelPreview } from "@/components/preview/DraggablePanelPreview";
import { ResizableTextPreview } from "@/components/preview/ResizableTextPreview";
import { SelectableElements } from "@/components/preview/SelectableElements";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { getProjectAsset, recommendedAssetCatalog, referenceImageAssets, uploadedImageAssets } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";
import { TEXT_LIMITS } from "@/lib/constants";
import { templatesForType } from "@/lib/templates/catalog";
import { applyVisualStyle } from "@/lib/templates/visualStyle";
import { editorialProfiles } from "@/lib/editorial/profiles";
import { artDirectionForCover, editableDirectionCopy } from "@/lib/templates/artDirection";
import type { Asset, AssetPlacement, CarouselProject, CarouselSlide, SlideAppearance } from "@/types/carousel";

type Props = {
  project: CarouselProject;
  onChange: (project: CarouselProject) => void;
  onRegenerateSlide?: (slideId: string) => void;
  busy?: boolean;
};

function replaceSlide(project: CarouselProject, nextSlide: CarouselSlide): CarouselProject {
  const slides = project.slides.map((slide) => slide.id === nextSlide.id ? nextSlide : slide);
  const cover = slides[0];
  return {
    ...project,
    title: cover.type === "cover" ? cover.title : project.title,
    subtitle: cover.type === "cover" ? cover.subtitle : project.subtitle,
    status: "draft",
    slides,
  };
}

function TextField({ label, value, maxLength, multiline = false, className = "", onChange }: {
  label: string;
  value: string;
  maxLength: number;
  multiline?: boolean;
  className?: string;
  onChange: (value: string) => void;
}) {
  const control = multiline
    ? <textarea value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />
    : <input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />;
  return (
    <label className={`editor-field ${className}`}>
      <span>{label}<small className={value.length >= maxLength ? "at-limit" : ""}>{value.length}/{maxLength}</small></span>
      {control}
    </label>
  );
}

export function ProjectEditor({ project, onChange, onRegenerateSlide, busy = false }: Props) {
  const [selectedId, setSelectedId] = useState(project.slides[0]?.id ?? "");
  const [savedVisuals, setSavedVisuals] = useState<Asset[]>([]);
  const [dragMode, setDragMode] = useState<"panel" | "elements" | "resize" | "image">("panel");
  const preview = useRef<HTMLDivElement>(null);
  const automaticAssignments = useMemo(() => assignAssetsToProject(project, recommendedAssetCatalog), [project]);
  const selectedIndex = Math.max(project.slides.findIndex((slide) => slide.id === selectedId), 0);
  const slide = project.slides[selectedIndex]!;
  const direction = artDirectionForCover(project.slides[0]?.templateId ?? slide.templateId);
  const copy = editableDirectionCopy(direction, slide.appearance);
  const extraTexts: Array<[keyof NonNullable<SlideAppearance["texts"]>, string, string]> = [
    ["series", "Texto de cabecera y pie", slide.appearance?.texts?.series ?? direction.replace("-", " ")],
    ...(slide.type === "cover" ? [
      ["coverKicker", "Etiqueta sobre el título", copy.coverKicker],
      ["coverBadge", "Insignia de portada", copy.coverBadge],
      ["displayWord", "Palabra decorativa", copy.displayWord],
      ["signature", "Firma decorativa", copy.signature],
    ] as Array<[keyof NonNullable<SlideAppearance["texts"]>, string, string]> : slide.type === "content" ? [
      ["contentKicker", "Etiqueta sobre el título", copy.contentKicker],
      ["highlightLabel", "Etiqueta del destacado", copy.highlightLabel],
      ["visualCaption", "Frase del panel visual", copy.visualCaption],
      ["step1", "Texto visual 1", copy.visualSteps[0]],
      ["step2", "Texto visual 2", copy.visualSteps[1]],
      ["step3", "Texto visual 3", copy.visualSteps[2]],
    ] as Array<[keyof NonNullable<SlideAppearance["texts"]>, string, string]> : [
      ["closingKicker", "Etiqueta sobre el título", copy.closingKicker],
      ["ctaLabel", "Etiqueta de la llamada a la acción", copy.ctaLabel],
      ["signature", "Firma del cierre", copy.signature],
      ["displayWord", "Palabra decorativa", copy.displayWord],
    ] as Array<[keyof NonNullable<SlideAppearance["texts"]>, string, string]>),
  ];
  const displayedAssetId = getProjectAsset(project, slide.assetId)?.id ?? automaticAssignments[slide.id];

  useEffect(() => {
    if (!project.slides.some((item) => item.id === selectedId)) setSelectedId(project.slides[0]?.id ?? "");
  }, [project.id, project.slides, selectedId]);

  useEffect(() => {
    let active = true;
    void fetch("/api/media")
      .then((response) => response.ok ? response.json() : { urls: [] })
      .then((result: { urls?: string[] }) => { if (active) setSavedVisuals(uploadedImageAssets(result.urls ?? [])); })
      .catch(() => { if (active) setSavedVisuals([]); });
    return () => { active = false; };
  }, []);

  function updateSlide(nextSlide: CarouselSlide) {
    onChange(replaceSlide(project, nextSlide));
  }

  function updateAppearance(next: Partial<SlideAppearance>) {
    const geometryChanged = "panelPosition" in next || "elementPositions" in next || "textSizes" in next;
    const fontSizes = { ...slide.appearance?.fontSizes };
    if (geometryChanged) {
      preview.current?.querySelectorAll<HTMLElement>("[data-autofit]").forEach((element) => {
        const id = element.closest<HTMLElement>("[data-movable-element]")?.dataset.movableElement;
        const size = Number.parseFloat(getComputedStyle(element).fontSize);
        if (id && Number.isFinite(size) && size > 0 && size <= 300) fontSizes[id] = size;
      });
    }
    updateSlide({ ...slide, appearance: { ...slide.appearance, ...(geometryChanged ? { fontSizes } : {}), ...next } });
  }

  function moveContent(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target <= 0 || target >= project.slides.length - 1) return;
    const slides = [...project.slides];
    [slides[index], slides[target]] = [slides[target]!, slides[index]!];
    const normalized = slides.map((slide, order) => ({
      ...slide,
      order,
      ...(slide.type === "content" ? { number: order } : {}),
    })) as CarouselSlide[];
    onChange({ ...project, status: "draft", slides: normalized });
  }

  function varyDesign() {
    const slides = project.slides.map((slide) => {
      const options = templatesForType(slide.type);
      const currentIndex = Math.max(options.findIndex((template) => template.id === slide.templateId), 0);
      return { ...slide, templateId: options[(currentIndex + 1) % options.length]!.id };
    }) as CarouselSlide[];
    onChange({ ...project, status: "draft", slides });
  }

  return (
    <section className="editor-section">
      <div className="section-heading">
        <div><span>Editor visual</span><h2>{project.title}</h2></div>
        <div className="editor-heading-actions">
          <button type="button" className="secondary-button" onClick={varyDesign}>Cambiar dirección completa</button>
        </div>
      </div>
      <div className="editor-preferences">
        <label className="editor-field">
          <span>Perfil editorial</span>
          <select value={project.editorialProfile} onChange={(event) => onChange({ ...project, editorialProfile: event.target.value as CarouselProject["editorialProfile"], status: "draft" })}>
            {editorialProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}
          </select>
        </label>
        <label className="editor-field">
          <span>Dirección visual</span>
          <select value={project.visualStyle} onChange={(event) => onChange(applyVisualStyle(project, event.target.value as CarouselProject["visualStyle"]))}>
            <option value="balanced">Equilibrado</option>
            <option value="minimal">Minimalista</option>
            <option value="bold">Impactante</option>
            <option value="image-led">Assets protagonistas</option>
            <option value="text-led">Texto protagonista</option>
          </select>
        </label>
        <p>La portada define una de 12 direcciones creativas para todo el carrusel. Estos cambios se ven al instante y no vuelven a llamar a la IA.</p>
      </div>
      <div className="editor-workbench">
        <nav className="slide-navigator" aria-label="Páginas del carrusel">
          <div><span>Páginas</span><b>{project.slides.length}</b></div>
          {project.slides.map((item, index) => (
            <button key={item.id} type="button" className={item.id === slide.id ? "active" : ""} onClick={() => setSelectedId(item.id)}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><strong>{item.title}</strong><small>{item.type} · {item.templateId}</small></div>
            </button>
          ))}
        </nav>
        <div className="active-slide-preview" ref={preview}>
          <div className="segmented-control" aria-label="Qué mover">
            <button type="button" className={dragMode === "panel" ? "active" : ""} aria-pressed={dragMode === "panel"} onClick={() => setDragMode("panel")}>Mover panel</button>
            <button type="button" className={dragMode === "elements" ? "active" : ""} aria-pressed={dragMode === "elements"} onClick={() => setDragMode("elements")}>Mover elementos</button>
            <button type="button" className={dragMode === "resize" ? "active" : ""} aria-pressed={dragMode === "resize"} onClick={() => setDragMode("resize")}>Tamaño de textos</button>
            <button type="button" className={dragMode === "image" ? "active" : ""} aria-pressed={dragMode === "image"} onClick={() => setDragMode("image")}>Mover imagen</button>
          </div>
          <div className="preview-image-size">
            <label className="editor-field"><span>Tamaño de la imagen</span><input aria-label="Tamaño de la imagen" type="range" min={25} max={300} step={5} value={Math.round((slide.appearance?.assetEditing?.scale ?? 1) * 100)} onChange={(event) => updateAppearance({ assetEditing: { ...slide.appearance?.assetEditing, scale: event.target.valueAsNumber / 100 } })} /></label>
            <label className="editor-field"><span>Porcentaje</span><input aria-label="Tamaño de la imagen en porcentaje" type="number" min={25} max={300} step={5} value={Math.round((slide.appearance?.assetEditing?.scale ?? 1) * 100)} onChange={(event) => { const value = event.target.valueAsNumber; if (Number.isFinite(value)) updateAppearance({ assetEditing: { ...slide.appearance?.assetEditing, scale: Math.max(25, Math.min(300, value)) / 100 } }); }} /></label>
          </div>
          <SelectableElements key={`${project.id}:${slide.id}:${slide.templateId}`} hiddenElements={slide.appearance?.hiddenElements ?? []} onDelete={(id) => updateAppearance({ hiddenElements: [...new Set([...(slide.appearance?.hiddenElements ?? []), id])] })} onRestore={(id) => updateAppearance({ hiddenElements: (slide.appearance?.hiddenElements ?? []).filter((item) => item !== id) })}>
          <ResizableTextPreview key={`${project.id}:${slide.id}:${slide.templateId}:${dragMode}`} enabled={dragMode === "resize"} onResize={(id, size) => updateAppearance({ textSizes: { ...slide.appearance?.textSizes, [id]: size } })}>
          <DraggablePanelPreview mode={dragMode === "resize" ? "elements" : dragMode} disabled={dragMode === "resize"} elementPositions={slide.appearance?.elementPositions} onMoveElement={(id, position) => updateAppearance({ elementPositions: { ...slide.appearance?.elementPositions, [id]: position } })} position={slide.appearance?.panelPosition ?? { x: 0, y: 0 }} onMove={(panelPosition) => updateAppearance({ panelPosition })}>
          <PreviewFrame label={`${slide.order + 1}. ${slide.type} · ${slide.templateId}`}>
            <SlideRenderer project={project} slide={slide} asset={getProjectAsset(project, displayedAssetId)} />
          </PreviewFrame>
          </DraggablePanelPreview>
          </ResizableTextPreview>
          </SelectableElements>
          <p className="panel-drag-hint">{dragMode === "resize" ? "Arrastra la esquina inferior derecha del cuadro de texto para cambiar su ancho y alto." : dragMode === "panel" ? "Arrastra el panel de texto para moverlo." : dragMode === "image" ? "Arrastra la imagen para moverla. Ajusta su tamaño y apariencia en Imagen o foto." : "Arrastra un título, texto, tarjeta, figura o imagen para moverlo por separado."}</p>
          <div className="preview-pager">
            <button type="button" disabled={selectedIndex === 0} onClick={() => setSelectedId(project.slides[selectedIndex - 1]!.id)}>← Anterior</button>
            <span>{selectedIndex + 1} / {project.slides.length}</span>
            <button type="button" disabled={selectedIndex === project.slides.length - 1} onClick={() => setSelectedId(project.slides[selectedIndex + 1]!.id)}>Siguiente →</button>
          </div>
        </div>
        <aside className="editor-control-panel">
          <div className="slide-editor-toolbar">
            <strong>Página {selectedIndex + 1}</strong>
            <span>
              {slide.type === "content" && (
                <>
                  <button type="button" disabled={selectedIndex === 1} onClick={() => moveContent(selectedIndex, -1)} aria-label={`Mover página ${selectedIndex + 1} hacia atrás`}>←</button>
                  <button type="button" disabled={selectedIndex === project.slides.length - 2} onClick={() => moveContent(selectedIndex, 1)} aria-label={`Mover página ${selectedIndex + 1} hacia adelante`}>→</button>
                </>
              )}
              {onRegenerateSlide && <button type="button" className="regen-slide" disabled={busy || project.id === "kalliom-demo"} onClick={() => onRegenerateSlide(slide.id)}>Mejorar texto</button>}
            </span>
          </div>
          <label className="editor-field">
            <span>Plantilla</span>
            <select value={slide.templateId} onChange={(event) => updateSlide({ ...slide, templateId: event.target.value as CarouselSlide["templateId"] })}>
              {templatesForType(slide.type).map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
            </select>
            <small className="template-hint">{templatesForType(slide.type).find((template) => template.id === slide.templateId)?.description ?? "Plantilla anterior: elige una composición recomendada para actualizarla."}</small>
          </label>
          <details className="appearance-controls" open>
            <summary>Color de los textos</summary>
            <p>Usa blanco sobre zonas oscuras y negro sobre zonas claras.</p>
            {[["title", "Título"], [slide.type === "cover" ? "subtitle" : "body", slide.type === "cover" ? "Subtítulo" : "Cuerpo"], ["kicker", "Antetítulo"], [slide.type === "content" ? "highlight" : slide.type === "closing" ? "cta" : "badge", slide.type === "content" ? "Destacado" : slide.type === "closing" ? "CTA" : "Etiqueta"]].map(([id, label]) => (
              <div className="text-color-control" key={id}>
                <label className="editor-field"><span>{label}</span><input type="color" aria-label={`Color de ${label}`} value={slide.appearance?.textColors?.[id] ?? "#ffffff"} onChange={(event) => updateAppearance({ textColors: { ...slide.appearance?.textColors, [id]: event.target.value } })} /></label>
                <button type="button" className="secondary-button" onClick={() => updateAppearance({ textColors: { ...slide.appearance?.textColors, [id]: "#ffffff" } })}>Blanco</button>
                <button type="button" className="secondary-button" onClick={() => updateAppearance({ textColors: { ...slide.appearance?.textColors, [id]: "#000000" } })}>Negro</button>
              </div>
            ))}
            <button type="button" className="secondary-button" onClick={() => updateAppearance({ textColors: {} })}>Restaurar colores de la plantilla</button>
          </details>
          <div className="panel-position-controls">
            <span>Posición del panel de texto</span>
            <div>
              {(["x", "y"] as const).map((axis) => <label className="editor-field" key={axis}><span>{axis === "x" ? "Horizontal" : "Vertical"}</span><input type="number" step={1} min={axis === "x" ? -1080 : -1350} max={axis === "x" ? 1080 : 1350} value={slide.appearance?.panelPosition?.[axis] ?? 0} onChange={(event) => { const value = event.target.valueAsNumber; if (Number.isFinite(value)) updateAppearance({ panelPosition: { x: slide.appearance?.panelPosition?.x ?? 0, y: slide.appearance?.panelPosition?.y ?? 0, [axis]: Math.max(axis === "x" ? -1080 : -1350, Math.min(axis === "x" ? 1080 : 1350, value)) } }); }} /></label>)}
            </div>
            <button type="button" className="secondary-button" onClick={() => updateAppearance({ panelPosition: { x: 0, y: 0 } })}>Restablecer posición</button>
            <button type="button" className="secondary-button" onClick={() => updateAppearance({ elementPositions: {} })}>Restablecer posiciones de elementos</button>
            <button type="button" className="secondary-button" onClick={() => updateAppearance({ textSizes: {} })}>Restablecer tamaños de textos</button>
          </div>
          <TextField label="Título" value={slide.title} maxLength={slide.type === "cover" ? TEXT_LIMITS.cover.title : slide.type === "content" ? TEXT_LIMITS.content.title : TEXT_LIMITS.closing.title} onChange={(title) => updateSlide({ ...slide, title })} />
          {slide.type === "cover" && <TextField label="Subtítulo" value={slide.subtitle} maxLength={TEXT_LIMITS.cover.subtitle} multiline onChange={(subtitle) => updateSlide({ ...slide, subtitle })} />}
          {(slide.type === "content" || slide.type === "closing") && <TextField label="Cuerpo" value={slide.body} maxLength={slide.type === "content" ? TEXT_LIMITS.content.body : TEXT_LIMITS.closing.body} multiline onChange={(body) => updateSlide({ ...slide, body })} />}
          {slide.type === "content" && <TextField label="Destacado" value={slide.highlight} maxLength={TEXT_LIMITS.content.highlight} multiline onChange={(highlight) => updateSlide({ ...slide, highlight })} />}
          {slide.type === "closing" && <TextField className="cta-editor-field" label="CTA" value={slide.cta} maxLength={TEXT_LIMITS.closing.cta} multiline onChange={(cta) => updateSlide({ ...slide, cta })} />}
          <details className="appearance-controls" open>
            <summary>Textos de la plantilla</summary>
            <p>Puedes cambiar estas frases o dejar el campo vacío para quitarlas.</p>
            {extraTexts.map(([key, label, value]) => <TextField key={key} label={label} value={value} maxLength={100} onChange={(text) => updateAppearance({ texts: { ...slide.appearance?.texts, [key]: text } })} />)}
            <button type="button" className="secondary-button" onClick={() => updateAppearance({ texts: undefined })}>Restaurar textos de la plantilla</button>
          </details>
          <details className="appearance-controls">
            <summary>Marca y sitio web</summary>
            <TextField label="Nombre de marca" value={project.brand.name} maxLength={50} onChange={(name) => onChange({ ...project, status: "draft", brand: { ...project.brand, name } })} />
            <TextField label="Sitio web" value={project.brand.website} maxLength={100} onChange={(website) => onChange({ ...project, status: "draft", brand: { ...project.brand, website } })} />
          </details>
          <AssetPicker
            assets={[...referenceImageAssets(project.referenceImageUrls), ...savedVisuals, ...recommendedAssetCatalog].filter((asset) => asset.compatibleLayouts.includes(slide.type))}
            selectedId={displayedAssetId}
            onSelect={(assetId) => updateSlide({ ...slide, assetId })}
          />
          <details className="appearance-controls" open>
            <summary>Imagen o foto</summary>
            <p>Ajusta la foto y usa «Mover imagen» para colocarla en la página.</p>
            {([
              ["scale", "Tamaño", 0.25, 3, 0.05, 1],
              ["rotation", "Giro", -180, 180, 1, getProjectAsset(project, displayedAssetId)?.rotation ?? 0],
              ["opacity", "Visibilidad", 0, 1, 0.05, 1],
            ] as const).map(([key, label, min, max, step, fallback]) => <label className="editor-field" key={key}><span>{label}<small>{key === "rotation" ? `${slide.appearance?.assetEditing?.[key] ?? fallback}°` : `${Math.round((slide.appearance?.assetEditing?.[key] ?? fallback) * 100)}%`}</small></span><input type="range" min={min} max={max} step={step} value={slide.appearance?.assetEditing?.[key] ?? fallback} onChange={(event) => updateAppearance({ assetEditing: { ...slide.appearance?.assetEditing, [key]: event.target.valueAsNumber } })} /></label>)}
            <label className="editor-field"><span>Encuadre</span><select value={slide.appearance?.assetEditing?.fit ?? "cover"} onChange={(event) => updateAppearance({ assetEditing: { ...slide.appearance?.assetEditing, fit: event.target.value as "cover" | "contain" } })}><option value="cover">Llenar el espacio</option><option value="contain">Mostrar foto completa</option></select></label>
            <label><input type="checkbox" checked={slide.appearance?.assetEditing?.fullPhoto ?? false} onChange={(event) => updateAppearance({ assetEditing: { ...slide.appearance?.assetEditing, fullPhoto: event.target.checked } })} /> Quitar recorte decorativo</label>
            <button type="button" className="secondary-button" onClick={() => updateAppearance({ assetEditing: { scale: 1, opacity: 1, rotation: 0, fit: "contain", fullPhoto: true }, showAsset: true, hiddenElements: (slide.appearance?.hiddenElements ?? []).filter((id) => id !== "asset") })}>Mostrar foto con claridad</button>
            <button type="button" className="secondary-button" onClick={() => updateAppearance({ assetEditing: undefined, elementPositions: { ...slide.appearance?.elementPositions, asset: { x: 0, y: 0 } } })}>Restablecer imagen</button>
          </details>
          <details className="appearance-controls">
            <summary>Elementos visuales</summary>
            <p>Oculta lo que no aporte al mensaje o cambia la ubicación del visual. Estos ajustes también se conservan al descargar.</p>
            <div className="appearance-toggles">
              <label><input type="checkbox" checked={slide.appearance?.showBackground !== false} onChange={(event) => updateAppearance({ showBackground: event.target.checked })} /> Fondo</label>
              <label><input type="checkbox" checked={slide.appearance?.showDecor !== false} onChange={(event) => updateAppearance({ showDecor: event.target.checked })} /> Figuras decorativas</label>
              <label><input type="checkbox" checked={slide.appearance?.showScene !== false} onChange={(event) => updateAppearance({ showScene: event.target.checked })} /> Símbolos y textos decorativos</label>
              <label><input type="checkbox" checked={slide.appearance?.showHeader !== false} onChange={(event) => updateAppearance({ showHeader: event.target.checked })} /> Marca y número superior</label>
              <label><input type="checkbox" checked={slide.appearance?.showFooter !== false} onChange={(event) => updateAppearance({ showFooter: event.target.checked })} /> Progreso y número inferior</label>
              <label><input type="checkbox" checked={slide.appearance?.showAsset !== false} onChange={(event) => updateAppearance({ showAsset: event.target.checked })} /> Imagen o ilustración</label>
            </div>
            <label className="editor-field"><span>Ubicación de imagen o ilustración</span>
              <select value={slide.appearance?.assetPlacement ?? getProjectAsset(project, displayedAssetId)?.placement ?? "right"} onChange={(event) => updateAppearance({ assetPlacement: event.target.value as AssetPlacement })}>
                <option value="left">Izquierda</option><option value="right">Derecha</option><option value="top-left">Arriba izquierda</option><option value="top-right">Arriba derecha</option><option value="bottom-left">Abajo izquierda</option><option value="bottom-right">Abajo derecha</option><option value="center">Centro</option>
              </select>
            </label>
          </details>
        </aside>
      </div>
      <details className="linkedin-drawer">
        <summary><span>Texto para acompañar la publicación</span><small>{project.linkedInCopy.length}/3000</small></summary>
        <textarea value={project.linkedInCopy} maxLength={3000} onChange={(event) => onChange({ ...project, status: "draft", linkedInCopy: event.target.value })} />
      </details>
    </section>
  );
}
