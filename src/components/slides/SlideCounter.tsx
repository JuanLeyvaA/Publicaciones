import type { ArtDirectionId } from "@/lib/templates/artDirection";

type Props = { index: number; total: number; direction: ArtDirectionId };

export function SlideCounter({ index, total, direction }: Props) {
  const percent = ((index + 1) / total) * 100;
  return (
    <div className="slide-footer" data-overflow-check="footer" data-collision-check="footer">
      <div className="progress-track" aria-label={`Progreso ${Math.round(percent)}%`}><span style={{ width: `${percent}%` }} /></div>
      <em className="footer-direction">{direction.replace("-", " ")}</em>
      <strong>{String(index + 1).padStart(2, "0")}</strong>
      <span>/ {String(total).padStart(2, "0")}</span>
    </div>
  );
}
