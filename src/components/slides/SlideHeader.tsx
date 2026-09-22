import type { ArtDirectionId } from "@/lib/templates/artDirection";

type Props = { brand: string; index: number; total: number; direction: ArtDirectionId };

export function SlideHeader({ brand, index, total, direction }: Props) {
  return (
    <header className="slide-header" data-overflow-check="header" data-collision-check="header">
      <div className="brand-mark"><span className="brand-glyph">K</span><span>{brand}</span></div>
      <div className="header-series" aria-hidden="true">{direction.replace("-", " ")}</div>
      <div className="header-meta"><span className="pulse-dot" />{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</div>
    </header>
  );
}
