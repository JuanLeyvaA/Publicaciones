"use client";

import type { DragEvent } from "react";
import type { ProjectHistoryItem } from "@/lib/projects/repository";

type Props = {
  projects: ProjectHistoryItem[];
  activeId: string;
  busy: boolean;
  onOpen: (id: string) => void;
};

export function ProjectHistory({ projects, activeId, busy, onOpen }: Props) {
  function beginDrag(event: DragEvent<HTMLButtonElement>, id: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.setData("application/x-kalliom-project", id);
  }

  return (
    <details className="history-panel" open>
      <summary><span>Publicaciones nuevas</span><small>{projects.length} pendientes</small></summary>
      <div className="history-list">
        {projects.map((project) => (
          <button
            key={project.id}
            type="button"
            disabled={busy}
            draggable={!busy}
            className={project.id === activeId ? "active" : ""}
            title="Arrastra a Ya usadas o No me interesan"
            onDragStart={(event) => beginDrag(event, project.id)}
            onClick={() => onOpen(project.id)}
          >
            <span><strong>{project.title}</strong><small>{project.topic}</small></span>
            <i className="content-state-badge state-new">Nuevo · arrastrar</i>
            <span><b>{project.slideCount} pág.</b><em>{project.editorialStatus}</em><b>{project.qualityScore}/100</b><time>{project.scheduledAt ? new Date(project.scheduledAt).toLocaleDateString("es-CO") : new Date(project.updatedAt).toLocaleDateString("es-CO")}</time></span>
          </button>
        ))}
        {!projects.length && <p>No hay publicaciones nuevas pendientes.</p>}
      </div>
    </details>
  );
}
