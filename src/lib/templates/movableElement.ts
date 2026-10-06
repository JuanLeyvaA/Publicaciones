import type { SlideAppearance } from "@/types/carousel";
import type { CSSProperties } from "react";

export function movableElement(appearance: SlideAppearance | undefined, id: string) {
  const position = appearance?.elementPositions?.[id] ?? { x: 0, y: 0 };
  const size = appearance?.textSizes?.[id];
  const resizable = ["title", "body", "subtitle", "kicker", "badge", "highlight", "cta", "signature", "website", "caption", "card-one", "card-two"].includes(id);
  const style: CSSProperties = { translate: `${position.x}px ${position.y}px`, ...(size && resizable ? { width: size.width, height: size.height, minWidth: 0, maxWidth: "none", minHeight: 0, maxHeight: "none", boxSizing: "border-box", flexShrink: 0 } as CSSProperties : {}) };
  const hidden = appearance?.hiddenElements?.includes(id);
  return { "data-movable-element": id, "data-resizable-text": resizable ? id : undefined, "data-element-hidden": hidden ? "true" : undefined, style: { ...style, ...(hidden ? { display: "none" } : {}) } };
}
