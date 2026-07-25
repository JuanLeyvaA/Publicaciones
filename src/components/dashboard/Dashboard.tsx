"use client";

import { useCallback, useEffect, useState } from "react";
import { CreateCarouselForm } from "@/components/projects/CreateCarouselForm";
import { BatchGenerator } from "@/components/projects/BatchGenerator";
import { EditorialCalendar } from "@/components/projects/EditorialCalendar";
import { EditorialControls } from "@/components/projects/EditorialControls";
import { ProjectEditor } from "@/components/projects/ProjectEditor";
import { ProjectHistory } from "@/components/projects/ProjectHistory";
import type { ProjectHistoryItem } from "@/lib/projects/repository";
import type { CarouselProject } from "@/types/carousel";

type GenerationMeta = {
  cached: boolean;
  usage: { inputTokens: number; outputTokens: number; calls: number; model: string };
};
type WorkspaceView = "editor" | "create" | "calendar";
type CreationMode = "single" | "batch";

export function Dashboard({ project }: { project: CarouselProject }) {
  const [activeProject, setActiveProject] = useState(project);
  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [exportReady, setExportReady] = useState(false);
  const [generationMeta, setGenerationMeta] = useState<GenerationMeta | null>(null);
  const [view, setView] = useState<WorkspaceView>("editor");
  const [creationMode, setCreationMode] = useState<CreationMode>("single");

  const refreshHistory = useCallback(async () => {
    const response = await fetch("/api/projects", { cache: "no-store" });
    if (!response.ok) return;
    const result = await response.json();
    setHistory(result.projects);
  }, []);

  useEffect(() => { void refreshHistory(); }, [refreshHistory]);

  function changeProject(nextProject: CarouselProject) {
    setActiveProject(nextProject);
    setDirty(true);
    setExportReady(false);
  }

  async function saveProject(projectToSave = activeProject) {
    if (projectToSave.id === "kalliom-demo") throw new Error("Genera o abre un proyecto para guardar cambios.");
    const response = await fetch(`/api/projects/${encodeURIComponent(projectToSave.id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ project: projectToSave }),
    });
    const result = await response.json();
    if (!response.ok) {
      const issue = result.issues?.[0]?.message;
      throw new Error(issue ? `${result.error} ${issue}` : result.error ?? "No fue posible guardar.");
    }
    setActiveProject(result.project);
    setDirty(false);
    await refreshHistory();
    return result.project as CarouselProject;
  }

  async function handleSave() {
    setBusy(true);
    setStatus("Guardando cambios…");
    try {
      await saveProject();
      setStatus("Proyecto guardado. Editar y guardar no consume tokens.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No fue posible guardar.");
    } finally { setBusy(false); }
  }

  async function validateProject() {
    setBusy(true);
    setStatus("Validando dimensiones, assets y desbordamientos…");
    try {
      const persisted = dirty ? await saveProject() : activeProject;
      if (persisted.id === "kalliom-demo") throw new Error("Genera o abre un proyecto para validarlo.");
      const response = await fetch(`/api/projects/${encodeURIComponent(persisted.id)}/validate`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "La validación visual falló.");
      setStatus(`Validación aprobada: ${result.slideCount} páginas miden 1080 × 1350 y no tienen overflow.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error de validación.");
    } finally { setBusy(false); }
  }

  async function exportProject() {
    setBusy(true);
    setExportReady(false);
    setStatus("Guardando, renderizando y validando las diapositivas…");
    try {
      const persisted = activeProject.id === "kalliom-demo" ? activeProject : (dirty ? await saveProject() : activeProject);
      const response = await fetch(`/api/projects/${encodeURIComponent(persisted.id)}/export`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          assetAssignments: Object.fromEntries(persisted.slides.flatMap((slide) => slide.assetId ? [[slide.id, slide.assetId]] : [])),
          ...(persisted.id === "kalliom-demo" ? { project: persisted } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No fue posible exportar.");
      setActiveProject({ ...persisted, status: "exported" });
      setExportReady(true);
      setStatus(`PDF listo: ${result.slideCount} páginas validadas.`);
      await refreshHistory();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error de exportación");
    } finally { setBusy(false); }
  }

  async function reviewQuality() {
    setBusy(true);
    setStatus("Revisando claridad, variedad, CTA y similitud con el historial…");
    try {
      const persisted = dirty ? await saveProject() : activeProject;
      const response = await fetch(`/api/projects/${encodeURIComponent(persisted.id)}/quality`, { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No fue posible revisar la calidad.");
      setActiveProject({ ...persisted, qualityReport: result.report });
      setStatus(`Revisión terminada: ${result.report.score}/100 y ${result.report.issues.length} observaciones.`);
      await refreshHistory();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No fue posible revisar.");
    } finally {
      setBusy(false);
    }
  }

  async function regeneratePart(target: { kind: "title" } | { kind: "cta" } | { kind: "linkedin" } | { kind: "slide"; slideId: string }) {
    setBusy(true);
    setStatus("Regenerando únicamente el fragmento seleccionado…");
    try {
      const persisted = dirty ? await saveProject() : activeProject;
      const response = await fetch(`/api/projects/${encodeURIComponent(persisted.id)}/regenerate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(target),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No fue posible regenerar.");
      setActiveProject(result.project);
      setDirty(false);
      setExportReady(false);
      setStatus(`Fragmento regenerado con ${result.usage.calls} llamada y ${result.usage.inputTokens + result.usage.outputTokens} tokens.`);
      await refreshHistory();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No fue posible regenerar.");
    } finally {
      setBusy(false);
    }
  }

  async function openProject(id: string) {
    if (dirty && !window.confirm("Hay cambios sin guardar. ¿Quieres abrir otro proyecto y descartarlos?")) return;
    setBusy(true);
    setStatus("Abriendo proyecto guardado…");
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(id)}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No fue posible abrir el proyecto.");
      setActiveProject(result.project);
      setGenerationMeta(null);
      setDirty(false);
      setExportReady(false);
      setStatus("Proyecto abierto desde el historial: 0 llamadas de IA.");
      setView("editor");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "No fue posible abrir.");
    } finally { setBusy(false); }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-brand"><span className="app-brand-icon">K</span><div>Kalliom Content Engine<small>Internal publishing studio</small></div></div>
        <span className="phase-chip">Fase 5 · Producción editorial</span>
      </header>
      <main className="dashboard">
        <section className="workspace-toolbar">
          <nav className="workspace-tabs" aria-label="Secciones principales">
            <button type="button" className={view === "editor" ? "active" : ""} onClick={() => setView("editor")}><span>01</span> Editor</button>
            <button type="button" className={view === "create" ? "active" : ""} onClick={() => setView("create")}><span>02</span> Crear</button>
            <button type="button" className={view === "calendar" ? "active" : ""} onClick={() => setView("calendar")}><span>03</span> Calendario</button>
          </nav>
          {view === "editor" && (
            <div className="production-actions">
              <button className="secondary-button" disabled={busy || activeProject.id === "kalliom-demo"} onClick={handleSave}>{dirty ? "Guardar" : "Guardado"}</button>
              <button className="secondary-button" disabled={busy || activeProject.id === "kalliom-demo"} onClick={validateProject}>Validar</button>
              <button className="export-button" disabled={busy} onClick={exportProject}>{busy ? "Procesando…" : "Crear PDF"}</button>
            </div>
          )}
        </section>
        <div className="workspace-layout">
          <aside className="workspace-sidebar">
            <div className="sidebar-heading"><span>Proyectos</span><button type="button" onClick={() => setView("create")}>＋ Nuevo</button></div>
            <ProjectHistory projects={history} activeId={activeProject.id} busy={busy} onOpen={openProject} />
          </aside>
          <section className="workspace-content">
            {status && <p className="status-message" role="status">{status}</p>}
            {view === "create" && (
              <>
                <div className="view-heading">
                  <div><span>Producción</span><h1>Crear contenido</h1><p>Elige un carrusel o un lote de hasta 20 temas.</p></div>
                  <div className="segmented-control">
                    <button type="button" className={creationMode === "single" ? "active" : ""} onClick={() => setCreationMode("single")}>Un carrusel</button>
                    <button type="button" className={creationMode === "batch" ? "active" : ""} onClick={() => setCreationMode("batch")}>Lote</button>
                  </div>
                </div>
                {creationMode === "batch" ? (
                  <BatchGenerator onCompleted={(projects, message) => {
                    if (projects[0]) setActiveProject(projects[0]);
                    setDirty(false);
                    setExportReady(false);
                    setStatus(message);
                    setView("editor");
                    void refreshHistory();
                  }} />
                ) : (
                  <CreateCarouselForm onGenerated={(nextProject, meta) => {
                    setActiveProject(nextProject);
                    setGenerationMeta(meta);
                    setDirty(false);
                    setExportReady(false);
                    setView("editor");
                    void refreshHistory();
                    setStatus(meta.cached ? "Contenido recuperado de caché: 0 llamadas nuevas." : `Contenido generado con ${meta.usage.calls} llamada${meta.usage.calls === 1 ? "" : "s"} y guardado en caché.`);
                  }} />
                )}
              </>
            )}
            {view === "calendar" && (
              <>
                <div className="view-heading"><div><span>Planificación</span><h1>Calendario editorial</h1><p>Programa y cambia estados sin abrir cada proyecto.</p></div></div>
                <EditorialCalendar projects={history} busy={busy} onOpen={openProject} onUpdated={(message) => { setStatus(message); void refreshHistory(); }} />
              </>
            )}
            {view === "editor" && (
              <>
                {exportReady && (
                  <div className="download-bar">
                    <span>PDF listo</span>
                    <a href={`/api/projects/${encodeURIComponent(activeProject.id)}/export?format=pdf`}>Descargar PDF</a>
                  </div>
                )}
                <section className="project-summary">
                  <div><strong>{activeProject.title}</strong><span>{dirty ? "Cambios sin guardar" : `Estado: ${activeProject.status}`}</span></div>
                  <span>{activeProject.slideCount} páginas · {activeProject.category} · {activeProject.language.toUpperCase()}</span>
                  {generationMeta && <em className={generationMeta.cached ? "cache-hit" : "cache-new"}>{generationMeta.cached ? "Caché reutilizada" : `${generationMeta.usage.model} · ${generationMeta.usage.inputTokens + generationMeta.usage.outputTokens} tokens`}</em>}
                </section>
                <EditorialControls project={activeProject} busy={busy} onQuality={reviewQuality} onRegenerate={(target) => void regeneratePart(target)} />
                <ProjectEditor project={activeProject} onChange={changeProject} busy={busy} onRegenerateSlide={(slideId) => void regeneratePart({ kind: "slide", slideId })} />
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
