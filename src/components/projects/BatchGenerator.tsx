"use client";

import { useState, type FormEvent } from "react";
import { editorialProfiles } from "@/lib/editorial/profiles";
import type { CarouselProject } from "@/types/carousel";

type Props = {
  onCompleted: (projects: CarouselProject[], message: string) => void;
};

export function BatchGenerator({ onCompleted }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const topics = String(data.get("topics") ?? "").split(/\r?\n/).map((topic) => topic.trim()).filter(Boolean);
    if (topics.length > 20) {
      setError("El máximo es de 20 temas por lote.");
      setBusy(false);
      return;
    }
    try {
      const start = data.get("startDate");
      const response = await fetch("/api/projects/batch", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          topics,
          slideCount: Number(data.get("slideCount")),
          category: data.get("category"),
          language: data.get("language"),
          tone: data.get("tone"),
          editorialProfile: data.get("editorialProfile"),
          visualStyle: data.get("visualStyle"),
          startDate: start ? new Date(String(start)).toISOString() : undefined,
          intervalDays: Number(data.get("intervalDays")),
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
      <summary><span>Producción por lotes</span><small>Hasta 20 temas · calendario automático</small></summary>
      <form className="generator-form" onSubmit={submit}>
        <label className="field field-wide"><span>Temas — uno por línea</span><textarea name="topics" required rows={8} placeholder={"Automatización de seguimiento comercial\nErrores al implementar IA en una pyme\nCómo medir procesos antes de automatizarlos"} /></label>
        <label className="field"><span>Páginas</span><select name="slideCount" defaultValue="5">{Array.from({ length: 8 }, (_, index) => index + 3).map((count) => <option key={count}>{count}</option>)}</select></label>
        <label className="field"><span>Categoría</span><select name="category" defaultValue="automation"><option value="automation">Automatización</option><option value="web">Web</option><option value="artificial-intelligence">IA</option><option value="analytics">Analítica</option><option value="business">Negocios</option></select></label>
        <label className="field"><span>Idioma</span><select name="language"><option value="es">Español</option><option value="en">Inglés</option></select></label>
        <label className="field"><span>Tono</span><select name="tone" defaultValue="professional"><option value="educational">Educativo</option><option value="direct">Directo</option><option value="professional">Profesional</option></select></label>
        <label className="field"><span>Perfil</span><select name="editorialProfile">{editorialProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}</select></label>
        <label className="field"><span>Estilo visual</span><select name="visualStyle"><option value="balanced">Equilibrado</option><option value="minimal">Minimalista</option><option value="bold">Impactante</option><option value="image-led">Assets protagonistas</option><option value="text-led">Texto protagonista</option></select></label>
        <label className="field"><span>Primera fecha</span><input type="datetime-local" name="startDate" /></label>
        <label className="field"><span>Días entre publicaciones</span><input type="number" name="intervalDays" min="0" max="30" defaultValue="1" /></label>
        <label className="force-generation field-wide"><input type="checkbox" name="force" /><span>Ignorar caché <small>Puede consumir una llamada por cada tema.</small></span></label>
        <div className="generator-actions field-wide">
          <p>{error ? <span className="form-error">{error}</span> : "La memoria editorial evita enfoques recientes y también compara los temas del mismo lote."}</p>
          <button className="generate-button" disabled={busy}>{busy ? "Generando lote…" : "Generar lote"}</button>
        </div>
      </form>
    </details>
  );
}
