"use client";

import { useState, type DragEvent } from "react";
import type { ProjectHistoryItem } from "@/lib/projects/repository";
import type { ContentState } from "@/types/carousel";

type Props = {
  projects: ProjectHistoryItem[];
  busy: boolean;
  onOpen: (id: string) => void;
  onMove: (id: string, state: ContentState) => Promise<void>;
};

const columns: Array<{ id: ContentState; label: string; description: string }> = [
  { id: "new", label: "Nuevas", description: "Recién creadas y pendientes de decidir." },
  { id: "used", label: "Ya usadas", description: "Publicadas o aprovechadas." },
  { id: "discarded", label: "No me interesan", description: "Ideas que no quieres utilizar." },
];

export function ContentLibrary({ projects, busy, onOpen, onMove }: Props) {
  const [draggedId, setDraggedId] = useState("");
  const [overColumn, setOverColumn] = useState<ContentState | "">("");

  function beginDrag(event: DragEvent<HTMLElement>, id: string) {
    setDraggedId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.setData("application/x-kalliom-project", id);
  }

  async function drop(event: DragEvent<HTMLElement>, state: ContentState) {
    event.preventDefault();
    const id = event.dataTransfer.getData("application/x-kalliom-project") || event.dataTransfer.getData("text/plain") || draggedId;
    setDraggedId("");
    setOverColumn("");
    const project = projects.find((item) => item.id === id);
    if (!project || project.contentState === state) return;
    await onMove(id, state);
  }

  return (
    <section className="content-library" aria-label="Biblioteca de publicaciones">
      {columns.map((column) => {
        const items = projects.filter((project) => project.contentState === column.id);
        return (
          <section
            key={column.id}
            className={`library-column state-${column.id}${overColumn === column.id ? " drag-over" : ""}`}
            onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setOverColumn(column.id); }}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOverColumn(""); }}
            onDrop={(event) => void drop(event, column.id)}
          >
            <header>
              <div><strong>{column.label}</strong><span>{items.length}</span></div>
              <p>{column.description}</p>
            </header>
            <div className="library-stack">
              {items.map((project) => (
                <article
                  key={project.id}
                  draggable={!busy}
                  className={`library-card${draggedId === project.id ? " dragging" : ""}`}
                  onDragStart={(event) => beginDrag(event, project.id)}
                  onDragEnd={() => { setDraggedId(""); setOverColumn(""); }}
                >
                  <button type="button" disabled={busy} onClick={() => onOpen(project.id)}>
                    <span className={`content-state-badge state-${project.contentState}`}>{project.contentState === "new" ? "Nuevo" : project.contentState === "used" ? "Usado" : "Descartado"}</span>
                    <strong>{project.title}</strong>
                    <small>{project.topic}</small>
                    <footer><span>{project.slideCount} páginas</span><time>{new Date(project.updatedAt).toLocaleDateString("es-CO")}</time></footer>
                  </button>
                  <span className="drag-handle" aria-hidden="true">⋮⋮</span>
                </article>
              ))}
              {!items.length && <p className="library-empty">Arrastra publicaciones aquí.</p>}
            </div>
          </section>
        );
      })}
    </section>
  );
}
