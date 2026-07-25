"use client";

import { useEffect, useMemo, useState } from "react";
import { AssetPicker } from "@/components/assets/AssetPicker";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { assetCatalog, getAssetById } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";
import { TEXT_LIMITS } from "@/lib/constants";
import { templatesForType } from "@/lib/templates/catalog";
import { applyVisualStyle } from "@/lib/templates/visualStyle";
import { editorialProfiles } from "@/lib/editorial/profiles";
import type { CarouselProject, CarouselSlide } from "@/types/carousel";

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

function TextField({ label, value, maxLength, multiline = false, onChange }: {
  label: string;
  value: string;
  maxLength: number;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const control = multiline
    ? <textarea value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />
    : <input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} />;
  return (
    <label className="editor-field">
      <span>{label}<small className={value.length >= maxLength ? "at-limit" : ""}>{value.length}/{maxLength}</small></span>
      {control}
    </label>
  );
}

export function ProjectEditor({ project, onChange, onRegenerateSlide, busy = false }: Props) {
  const [selectedId, setSelectedId] = useState(project.slides[0]?.id ?? "");
  const automaticAssignments = useMemo(() => assignAssetsToProject(project, assetCatalog), [project]);
  const selectedIndex = Math.max(project.slides.findIndex((slide) => slide.id === selectedId), 0);
  const slide = project.slides[selectedIndex]!;

  useEffect(() => {
    if (!project.slides.some((item) => item.id === selectedId)) setSelectedId(project.slides[0]?.id ?? "");
  }, [project.id, project.slides, selectedId]);

  function updateSlide(nextSlide: CarouselSlide) {
    onChange(replaceSlide(project, nextSlide));
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
      const step = slide.type === "content" ? slide.order : 1;
      return { ...slide, templateId: options[(currentIndex + step) % options.length]!.id };
    }) as CarouselSlide[];
    onChange({ ...project, status: "draft", slides });
  }

  return (
    <section className="editor-section">
      <div className="section-heading">
        <div><span>Editor visual</span><h2>{project.title}</h2></div>
        <div className="editor-heading-actions">
          <button type="button" className="secondary-button" onClick={varyDesign}>Variar diseño</button>
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
        <p>Cambiar perfil, plantilla o asset es local y no consume tokens.</p>
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
        <div className="active-slide-preview">
          <PreviewFrame label={`${slide.order + 1}. ${slide.type} · ${slide.templateId}`}>
            <SlideRenderer project={project} slide={slide} asset={getAssetById(slide.assetId ?? automaticAssignments[slide.id])} />
          </PreviewFrame>
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
              {onRegenerateSlide && <button type="button" className="regen-slide" disabled={busy || project.id === "kalliom-demo"} onClick={() => onRegenerateSlide(slide.id)}>Regenerar</button>}
            </span>
          </div>
          <label className="editor-field">
            <span>Plantilla</span>
            <select value={slide.templateId} onChange={(event) => updateSlide({ ...slide, templateId: event.target.value as CarouselSlide["templateId"] })}>
              {templatesForType(slide.type).map((template) => <option key={template.id} value={template.id}>{template.label}</option>)}
            </select>
          </label>
          <TextField label="Título" value={slide.title} maxLength={slide.type === "cover" ? TEXT_LIMITS.cover.title : slide.type === "content" ? TEXT_LIMITS.content.title : TEXT_LIMITS.closing.title} onChange={(title) => updateSlide({ ...slide, title })} />
          {slide.type === "cover" && <TextField label="Subtítulo" value={slide.subtitle} maxLength={TEXT_LIMITS.cover.subtitle} multiline onChange={(subtitle) => updateSlide({ ...slide, subtitle })} />}
          {(slide.type === "content" || slide.type === "closing") && <TextField label="Cuerpo" value={slide.body} maxLength={slide.type === "content" ? TEXT_LIMITS.content.body : TEXT_LIMITS.closing.body} multiline onChange={(body) => updateSlide({ ...slide, body })} />}
          {slide.type === "content" && <TextField label="Destacado" value={slide.highlight} maxLength={TEXT_LIMITS.content.highlight} multiline onChange={(highlight) => updateSlide({ ...slide, highlight })} />}
          {slide.type === "closing" && <TextField label="CTA" value={slide.cta} maxLength={TEXT_LIMITS.closing.cta} multiline onChange={(cta) => updateSlide({ ...slide, cta })} />}
          <AssetPicker
            assets={assetCatalog.filter((asset) => asset.compatibleLayouts.includes(slide.type))}
            selectedId={slide.assetId ?? automaticAssignments[slide.id]}
            onSelect={(assetId) => updateSlide({ ...slide, assetId })}
          />
        </aside>
      </div>
      <details className="linkedin-drawer">
        <summary><span>Descripción para LinkedIn</span><small>{project.linkedInCopy.length}/3000</small></summary>
        <textarea value={project.linkedInCopy} maxLength={3000} onChange={(event) => onChange({ ...project, status: "draft", linkedInCopy: event.target.value })} />
      </details>
    </section>
  );
}
