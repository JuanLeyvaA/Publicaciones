import type { ArtDirectionId } from "@/lib/templates/artDirection";

type Props = { brand: string; index: number; total: number; direction: ArtDirectionId; series?: string };

export function SlideHeader({ brand, index, total, direction, series }: Props) {
  return (
    <header className="slide-header" data-selectable-element="header" data-overflow-check="header" data-collision-check="header">
      <div className="brand-mark"><span className="brand-glyph">K</span><span>{brand}</span></div>
      <div className="header-series" aria-hidden="true">{series ?? direction.replace("-", " ")}</div>
      <div className="header-meta"><span className="pulse-dot" />{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
    </header>
  );
}
