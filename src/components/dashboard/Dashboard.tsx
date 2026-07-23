"use client";

import { useState } from "react";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { SlideRenderer } from "@/components/slides/SlideRenderer";
import { AssetPicker } from "@/components/assets/AssetPicker";
import { CreateCarouselForm } from "@/components/projects/CreateCarouselForm";
import { assetCatalog, getAssetById } from "@/lib/assets/catalog";
import { assignAssetsToProject } from "@/lib/assets/selectAsset";
import type { CarouselProject } from "@/types/carousel";

export function Dashboard({ project }: { project: CarouselProject }) {
  const [activeProject, setActiveProject] = useState(project);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [generationMeta, setGenerationMeta] = useState<{ cached: boolean; usage: { inputTokens: number; outputTokens: number; calls: number; model: string } } | null>(null);
  const [assetAssignments, setAssetAssignments] = useState<Record<string, string>>(() => assignAssetsToProject(activeProject, assetCatalog));

  async function exportProject() {
    setBusy(true);
    setStatus("Renderizando y validando las diapositivas…");
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(activeProject.id)}/export`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assetAssignments }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No fue posible exportar.");
      setStatus(`Exportación lista: ${result.slideCount} PNG validados y PDF creado en ${result.directory}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error de exportación");
    } finally { setBusy(false); }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand"><span className="app-brand-icon">K</span><div>Kalliom Content Engine<small>Internal publishing studio</small></div></div>
        <span className="phase-chip">Fase 3 · IA y caché</span>
      </header>
      <main className="dashboard">
        <section className="dashboard-top">
          <div><h1>Kalliom Content Engine</h1><p>Una llamada de texto · Caché por hash · Assets seleccionados localmente</p></div>
          <button className="export-button" disabled={busy} onClick={exportProject}>{busy ? "Exportando…" : "Exportar PNG + PDF"}</button>
        </section>
        {status && <p className="status-message" role="status">{status}</p>}
        <CreateCarouselForm onGenerated={(nextProject, meta) => {
          setActiveProject(nextProject);
          setGenerationMeta(meta);
          setAssetAssignments(Object.fromEntries(nextProject.slides.map((slide) => [slide.id, slide.assetId ?? ""])));
          setStatus(meta.cached ? "Contenido recuperado de caché: 0 llamadas nuevas." : `Contenido generado con ${meta.usage.calls} llamada${meta.usage.calls === 1 ? "" : "s"} y guardado en caché.`);
        }} />
        <section className="project-summary">
          <strong>{activeProject.title}</strong>
          <span>{activeProject.slideCount} páginas · {activeProject.category} · {activeProject.language.toUpperCase()}</span>
          {generationMeta && <em className={generationMeta.cached ? "cache-hit" : "cache-new"}>{generationMeta.cached ? "Caché reutilizada" : `${generationMeta.usage.model} · ${generationMeta.usage.inputTokens + generationMeta.usage.outputTokens} tokens`}</em>}
        </section>
        <section className="slide-grid">
          {activeProject.slides.map((slide) => (
            <div className="asset-preview-group" key={slide.id}>
              <PreviewFrame label={`${slide.order + 1}. ${slide.type}`}>
                <SlideRenderer project={activeProject} slide={slide} asset={getAssetById(assetAssignments[slide.id])} />
              </PreviewFrame>
              <AssetPicker
                assets={assetCatalog}
                selectedId={assetAssignments[slide.id]}
                onSelect={(assetId) => {
                  setAssetAssignments((current) => ({ ...current, [slide.id]: assetId }));
                  setStatus(`Asset de la página ${slide.order + 1} actualizado a ${assetId}.`);
                }}
              />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
