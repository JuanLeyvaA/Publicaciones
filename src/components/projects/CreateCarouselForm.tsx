"use client";

import { useState, type FormEvent } from "react";
import { editorialProfiles } from "@/lib/editorial/profiles";
import { TEXT_LIMITS } from "@/lib/constants";
import type { CarouselProject } from "@/types/carousel";

type GenerationMeta = {
  cached: boolean;
  usage: { inputTokens: number; outputTokens: number; calls: number; model: string };
};

type Props = {
  onGenerated: (project: CarouselProject, meta: GenerationMeta) => void;
};

export function CreateCarouselForm({ onGenerated }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const payload = {
      topic: data.get("topic"),
      customTitle: data.get("customTitle") || undefined,
      slideCount: Number(data.get("slideCount")),
      category: data.get("category"),
      language: data.get("language"),
      tone: data.get("tone"),
      callToAction: data.get("callToAction") || undefined,
      editorialProfile: data.get("editorialProfile"),
      visualStyle: data.get("visualStyle"),
      scheduledAt: data.get("scheduledAt") ? new Date(String(data.get("scheduledAt"))).toISOString() : undefined,
      force: data.get("force") === "on",
    };
    try {
      const response = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No fue posible generar el proyecto.");
      onGenerated(result.project, { cached: result.cached, usage: result.usage });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Error desconocido.");
    } finally { setBusy(false); }
  }

  return (
    <details className="generator-panel" open>
      <summary><span>Nuevo carrusel</span><small>Tema + ajustes → carrusel editable</small></summary>
      <form className="generator-form" onSubmit={submit}>
        <label className="field field-wide"><span>Tema</span><textarea name="topic" required minLength={3} maxLength={240} rows={2} defaultValue="Cómo automatizar una pyme sin perder el trato humano" /></label>
        <label className="field field-wide"><span>Título opcional</span><input name="customTitle" maxLength={TEXT_LIMITS.cover.title} placeholder="Déjalo vacío para generarlo automáticamente" /></label>
        <label className="field"><span>Páginas</span><select name="slideCount" defaultValue="5">{Array.from({ length: 8 }, (_, index) => index + 3).map((count) => <option key={count}>{count}</option>)}</select></label>
        <label className="field"><span>Categoría</span><select name="category" defaultValue="automation"><option value="automation">Automatización</option><option value="web">Web</option><option value="artificial-intelligence">Inteligencia artificial</option><option value="analytics">Analítica</option><option value="business">Negocios</option></select></label>
        <label className="field"><span>Idioma</span><select name="language" defaultValue="es"><option value="es">Español</option><option value="en">Inglés</option></select></label>
        <label className="field"><span>Tono</span><select name="tone" defaultValue="professional"><option value="educational">Educativo</option><option value="direct">Directo</option><option value="professional">Profesional</option></select></label>
        <label className="field"><span>Perfil editorial</span><select name="editorialProfile" defaultValue="kalliom-professional">{editorialProfiles.map((profile) => <option key={profile.id} value={profile.id}>{profile.label}</option>)}</select></label>
        <label className="field"><span>Estilo visual</span><select name="visualStyle" defaultValue="balanced"><option value="balanced">Equilibrado</option><option value="minimal">Minimalista</option><option value="bold">Impactante</option><option value="image-led">Assets protagonistas</option><option value="text-led">Texto protagonista</option></select></label>
        <label className="field"><span>Programar</span><input type="datetime-local" name="scheduledAt" /></label>
        <label className="field field-wide"><span>CTA opcional</span><textarea name="callToAction" rows={2} maxLength={TEXT_LIMITS.closing.cta} placeholder="¿Qué proceso automatizarías primero?" /></label>
        <label className="force-generation field-wide"><input type="checkbox" name="force" /><span>Crear una versión nueva <small>Úsalo si ya generaste este mismo tema y quieres otro enfoque.</small></span></label>
        <div className="generator-actions field-wide">
          <p>{error ? <span className="form-error">{error}</span> : "Podrás cambiar textos, composición y visuales antes de descargar."}</p>
          <button className="generate-button" disabled={busy}>{busy ? "Generando…" : "Generar carrusel"}</button>
        </div>
      </form>
    </details>
  );
}
