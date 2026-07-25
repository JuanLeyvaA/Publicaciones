"use client";

import type { CarouselProject } from "@/types/carousel";

type RegenerationTarget = { kind: "title" } | { kind: "cta" } | { kind: "linkedin" };

type Props = {
  project: CarouselProject;
  busy: boolean;
  onQuality: () => void;
  onRegenerate: (target: RegenerationTarget) => void;
};

export function EditorialControls({ project, busy, onQuality, onRegenerate }: Props) {
  const report = project.qualityReport;
  return (
    <section className="quality-panel">
      <div className="quality-score">
        <span>Calidad editorial</span>
        <strong>{report.score}<small>/100</small></strong>
      </div>
      <div className="quality-details">
        <strong>{report.issues.length ? `${report.issues.length} observaciones` : "Sin observaciones locales"}</strong>
        <ul>
          {report.issues.slice(0, 3).map((issue, index) => <li key={`${issue.code}-${index}`} className={`severity-${issue.severity}`}>{issue.message}</li>)}
        </ul>
      </div>
      <div className="quality-actions">
        <button className="secondary-button" disabled={busy || project.id === "kalliom-demo"} onClick={onQuality}>Revisar calidad</button>
        <button className="secondary-button" disabled={busy || project.id === "kalliom-demo"} onClick={() => onRegenerate({ kind: "title" })}>Regenerar título</button>
        <button className="secondary-button" disabled={busy || project.id === "kalliom-demo"} onClick={() => onRegenerate({ kind: "cta" })}>Regenerar CTA</button>
        <button className="secondary-button" disabled={busy || project.id === "kalliom-demo"} onClick={() => onRegenerate({ kind: "linkedin" })}>Regenerar copy</button>
      </div>
    </section>
  );
}
