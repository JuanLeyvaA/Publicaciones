type Props = { index: number; total: number };

export function SlideCounter({ index, total }: Props) {
  const percent = ((index + 1) / total) * 100;
  return (
    <div className="slide-footer" data-overflow-check="footer" data-collision-check="footer">
      <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
      <strong>{String(index + 1).padStart(2, "0")}</strong>
      <span>/ {String(total).padStart(2, "0")}</span>
    </div>
  );
}
