"use client";

import { useState } from "react";
import type { ProjectHistoryItem } from "@/lib/projects/repository";
import type { EditorialStatus } from "@/types/carousel";

type Props = {
  projects: ProjectHistoryItem[];
  busy: boolean;
  onOpen: (id: string) => void;
  onUpdated: (message: string) => void;
};

const statusLabels: Record<EditorialStatus, string> = {
  idea: "Idea",
  review: "En revisión",
  approved: "Aprobado",
  scheduled: "Programado",
  published: "Publicado",
};

function localDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function EditorialCalendar({ projects, busy, onOpen, onUpdated }: Props) {
  const [savingId, setSavingId] = useState("");
  const ordered = [...projects].sort((left, right) => {
    if (!left.scheduledAt) return 1;
    if (!right.scheduledAt) return -1;
    return left.scheduledAt.localeCompare(right.scheduledAt);
  });

  async function update(project: ProjectHistoryItem, form: HTMLFormElement) {
    const data = new FormData(form);
    const value = String(data.get("scheduledAt") ?? "");
    const editorialStatus = String(data.get("editorialStatus")) as EditorialStatus;
    setSavingId(project.id);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(project.id)}/schedule`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          editorialStatus,
          scheduledAt: value ? new Date(value).toISOString() : undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No fue posible programar.");
      onUpdated("Calendario editorial actualizado.");
    } catch (error) {
      onUpdated(error instanceof Error ? error.message : "No fue posible programar.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <details className="calendar-panel" open>
      <summary><span>Calendario editorial</span><small>{projects.filter((project) => project.scheduledAt).length} programados</small></summary>
      <div className="calendar-grid">
        {ordered.map((project) => (
          <form key={project.id} className={`calendar-card status-${project.editorialStatus}`} onSubmit={(event) => { event.preventDefault(); void update(project, event.currentTarget); }}>
            <button type="button" className="calendar-title" disabled={busy} onClick={() => onOpen(project.id)}>{project.title}</button>
            <small>{project.scheduledAt ? new Date(project.scheduledAt).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "Sin fecha"}</small>
            <div>
              <select name="editorialStatus" defaultValue={project.editorialStatus}>
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
              <input type="datetime-local" name="scheduledAt" defaultValue={localDateTime(project.scheduledAt)} />
              <button className="secondary-button" disabled={savingId === project.id}>{savingId === project.id ? "…" : "Guardar"}</button>
            </div>
            <span className={`quality-badge quality-${project.qualityScore >= 85 ? "good" : project.qualityScore >= 65 ? "medium" : "low"}`}>{project.qualityScore}/100</span>
          </form>
        ))}
        {!projects.length && <p className="calendar-empty">Genera un carrusel para comenzar el calendario.</p>}
      </div>
    </details>
  );
}
