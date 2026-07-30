"use client";

import { useState, type FormEvent } from "react";
import { editorialProfiles } from "@/lib/editorial/profiles";
import type { AssetCategory, CarouselProject, EditorialProfileId, VisualStyle } from "@/types/carousel";

type Props = {
  onCompleted: (projects: CarouselProject[], message: string) => void;
};

type BatchItem = {
  id: string;
  topic: string;
  slideCount: number;
  category: AssetCategory;
  language: "es" | "en";
  tone: "educational" | "direct" | "professional";
  editorialProfile: EditorialProfileId;
  visualStyle: VisualStyle;
  scheduledAt: string;
};

const categoryOptions = [
  ["automation", "Automatización"],
  ["web", "Web"],
  ["artificial-intelligence", "IA"],
  ["analytics", "Analítica"],
  ["business", "Negocios"],
] as const;

const visualOptions = [
  ["balanced", "Equilibrado"],
  ["minimal", "Minimalista"],
  ["bold", "Impactante"],
  ["image-led", "Assets protagonistas"],
  ["text-led", "Texto protagonista"],
] as const;

let itemSequence = 0;
function newItem(overrides: Partial<BatchItem> = {}): BatchItem {
  itemSequence += 1;
  return {
    id: `batch-item-${itemSequence}`,
    topic: "",
    slideCount: 5,
    category: "automation",
    language: "es",
    tone: "professional",
    editorialProfile: "kalliom-professional",
    visualStyle: "balanced",
    scheduledAt: "",
    ...overrides,
  };
}

export function BatchGenerator({ onCompleted }: Props) {
  const [items, setItems] = useState<BatchItem[]>(() => [
    newItem(),
    newItem({ category: "artificial-intelligence", visualStyle: "image-led" }),
    newItem({ category: "business", tone: "direct", visualStyle: "bold" }),
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function updateItem(id: string, patch: Partial<BatchItem>) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function duplicateSettingsFromFirst() {
    const first = items[0];
    if (!first) return;
    setItems((current) => current.map((item, index) => index === 0 ? item : {
      ...item,
      slideCount: first.slideCount,
      category: first.category,
      language: first.language,
      tone: first.tone,
      editorialProfile: first.editorialProfile,
      visualStyle: first.visualStyle,
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const configured = items.filter((item) => item.topic.trim());
    if (!configured.length) {
      setError("Escribe al menos un tema.");
      setBusy(false);
      return;
    }
    try {
      const data = new FormData(event.currentTarget);
      const response = await fetch("/api/projects/batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: configured.map(({ id: _id, scheduledAt, ...item }) => ({
            ...item,
            topic: item.topic.trim(),
            scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
          })),
          force: data.get("force") === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No fue posible generar el lote.");
      const failures = result.failures?.length ?? 0;
      onCompleted(
        result.projects,
        `Lote terminado: ${result.projects.length} carruseles, ${result.usage.calls} llamadas${failures ? ` y ${failures} errores` : ""}.`,
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Error desconocido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="generator-panel batch-panel" open>
      <summary><span>Producción por lotes</span><small>Cada publicación tiene configuración independiente</small></summary>
      <form className="batch-configurator" onSubmit={submit}>
        <div className="batch-toolbar">
          <p>{items.length} de 20 publicaciones</p>
          <div>
            <button type="button" className="secondary-button" onClick={duplicateSettingsFromFirst}>Copiar ajustes de la primera</button>
            <button type="button" className="secondary-button" disabled={items.length >= 20} onClick={() => setItems((current) => [...current, newItem()])}>＋ Añadir publicación</button>
          </div>
        </div>
        <div className="batch-items">
          {items.map((item, index) => (
            <fieldset className="batch-item" key={item.id}>
              <legend><span>{String(index + 1).padStart(2, "0")}</span> Publicación {index + 1}</legend>
              <label className="field batch-topic"><span>Tema</span><textarea required={index === 0} rows={2} maxLength={240} value={item.topic} onChange={(event) => updateItem(item.id, { topic: event.target.value })} placeholder="¿De qué debe hablar este carrusel?" /></label>
              <label className="field"><span>Páginas</span><select value={item.slideCount} onChange={(event) => updateItem(item.id, { slideCount: Number(event.target.value) })}>{Array.from({ length: 8 }, (_, pageIndex) => pageIndex + 3).map((count) => <option key={count}>{count}</option>)}</select></label>
              <label className="field"><span>Categoría</span><select value={item.category} onChange={(event) => updateItem(item.id, { category: event.target.value as AssetCategory })}>{categoryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="field"><span>Idioma</span><select value={item.language} onChange={(event) => updateItem(item.id, { language: event.target.value as BatchItem["language"] })}><option value="es">Español</option><option value="en">Inglés</option></select></label>
              <label className="field"><span>Tono</span><select value={item.tone} onChange={(event) => updateItem(item.id, { tone: event.target.value as BatchItem["tone"] })}><option value="educational">Educativo</option><option value="direct">Directo</option><option value="professional">Profesional</option></select></label>
              <label className="field"><span>Perfil</span><select value={item.editorialProfile} onChange={(event) => updateItem(item.id, { editorialProfile: event.target.value as EditorialProfileId })}>{editorialProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}</select></label>
              <label className="field"><span>Estilo visual</span><select value={item.visualStyle} onChange={(event) => updateItem(item.id, { visualStyle: event.target.value as VisualStyle })}>{visualOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="field"><span>Fecha editorial</span><input type="datetime-local" value={item.scheduledAt} onChange={(event) => updateItem(item.id, { scheduledAt: event.target.value })} /></label>
              <button type="button" className="batch-remove" disabled={items.length === 1} onClick={() => setItems((current) => current.filter((candidate) => candidate.id !== item.id))}>Eliminar</button>
            </fieldset>
          ))}
        </div>
        <div className="batch-footer">
          <label className="force-generation"><input type="checkbox" name="force" /><span>Ignorar caché <small>Puede consumir una llamada por publicación.</small></span></label>
          <p>{error ? <span className="form-error">{error}</span> : "Las filas sin tema se omiten. La fecha y todos los ajustes pertenecen únicamente a su publicación."}</p>
          <button className="generate-button" disabled={busy}>{busy ? "Generando lote…" : `Generar ${items.filter((item) => item.topic.trim()).length || ""} publicaciones`}</button>
        </div>
      </form>
    </details>
  );
}
