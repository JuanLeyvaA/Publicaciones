"use client";

import type { ProjectHistoryItem } from "@/lib/projects/repository";

type Props = {
  projects: ProjectHistoryItem[];
  activeId: string;
  busy: boolean;
  onOpen: (id: string) => void;
};

export function ProjectHistory({ projects, activeId, busy, onOpen }: Props) {
  return (
    <details className="history-panel" open>
      <summary><span>Historial de proyectos</span><small>{projects.length} guardados</small></summary>
      <div className="history-list">
        {projects.map((project) => (
          <button key={project.id} type="button" disabled={busy} className={project.id === activeId ? "active" : ""} onClick={() => onOpen(project.id)}>
            <span><strong>{project.title}</strong><small>{project.topic}</small></span>
            <span><b>{project.slideCount} pág.</b><em>{project.editorialStatus}</em><b>{project.qualityScore}/100</b><time>{project.scheduledAt ? new Date(project.scheduledAt).toLocaleDateString("es-CO") : new Date(project.updatedAt).toLocaleDateString("es-CO")}</time></span>
          </button>
        ))}
        {!projects.length && <p>Aún no hay proyectos guardados.</p>}
      </div>
    </details>
  );
}
