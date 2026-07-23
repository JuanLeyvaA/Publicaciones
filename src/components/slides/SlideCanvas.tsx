import type { CSSProperties, ReactNode } from "react";
import { SAFE_AREA, SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/constants";

type Props = {
  children: ReactNode;
  className?: string;
  slideId: string;
};

export function SlideCanvas({ children, className = "", slideId }: Props) {
  const fixedCanvas: CSSProperties = {
    position: "relative",
    width: `${SLIDE_WIDTH}px`,
    height: `${SLIDE_HEIGHT}px`,
    minWidth: `${SLIDE_WIDTH}px`,
    maxWidth: `${SLIDE_WIDTH}px`,
    minHeight: `${SLIDE_HEIGHT}px`,
    maxHeight: `${SLIDE_HEIGHT}px`,
    overflow: "hidden",
    boxSizing: "border-box",
    "--safe-top": `${SAFE_AREA.top}px`,
    "--safe-right": `${SAFE_AREA.right}px`,
    "--safe-bottom": `${SAFE_AREA.bottom}px`,
    "--safe-left": `${SAFE_AREA.left}px`,
  } as CSSProperties;

  return (
    <article
      id="slide-canvas"
      data-slide-id={slideId}
      data-canvas-width={SLIDE_WIDTH}
      data-canvas-height={SLIDE_HEIGHT}
      className={`slide-canvas kalliom-dark ${className}`}
      style={fixedCanvas}
    >
      {children}
    </article>
  );
}
