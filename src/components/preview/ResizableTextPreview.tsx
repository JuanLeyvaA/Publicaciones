"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";

type Size = { width: number; height: number };
type Resize = { element: HTMLElement; id: string; pointerId: number; x: number; y: number; scale: number; initial: Size; next: Size; maxWidth: number; maxHeight: number; originalStyle: string | null };

export function ResizableTextPreview({ children, enabled, onResize }: { children: ReactNode; enabled: boolean; onResize: (id: string, size: Size) => void }) {
  const resize = useRef<Resize | null>(null);

  function start(event: PointerEvent<HTMLDivElement>) {
    if (!enabled || event.button !== 0 || resize.current) return;
    const element = (event.target as HTMLElement).closest<HTMLElement>("[data-resizable-text]");
    const canvas = element?.closest<HTMLElement>("[data-canvas-width]");
    const safe = canvas?.querySelector<HTMLElement>("[data-safe-area]");
    if (!element || !canvas || !safe) return;
    const rect = element.getBoundingClientRect();
    if (event.clientX < rect.right - 18 || event.clientY < rect.bottom - 18) return;
    const bounds = safe.getBoundingClientRect();
    const scale = canvas.getBoundingClientRect().width / Number(canvas.dataset.canvasWidth);
    const initial = { width: rect.width / scale, height: rect.height / scale };
    resize.current = { element, id: element.dataset.resizableText!, pointerId: event.pointerId, x: event.clientX, y: event.clientY, scale, initial, next: initial,
      maxWidth: Math.min(1080, Math.max(40, (bounds.right - rect.left) / scale)), maxHeight: Math.min(1350, Math.max(30, (bounds.bottom - rect.top) / scale)), originalStyle: element.getAttribute("style") };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const current = resize.current;
    if (!current || current.pointerId !== event.pointerId) return;
    current.next = { width: Math.round(Math.max(40, Math.min(current.maxWidth, current.initial.width + (event.clientX - current.x) / current.scale))), height: Math.round(Math.max(30, Math.min(current.maxHeight, current.initial.height + (event.clientY - current.y) / current.scale))) };
    Object.assign(current.element.style, { width: `${current.next.width}px`, height: `${current.next.height}px`, minWidth: "0", maxWidth: "none", minHeight: "0", maxHeight: "none", boxSizing: "border-box", flexShrink: "0" });
  }

  function finish(event: PointerEvent<HTMLDivElement>, cancel = false) {
    const current = resize.current;
    if (!current || current.pointerId !== event.pointerId) return;
    resize.current = null;
    if (cancel) {
      if (current.originalStyle === null) current.element.removeAttribute("style");
      else current.element.setAttribute("style", current.originalStyle);
    } else if (current.next !== current.initial) onResize(current.id, current.next);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <div className={enabled ? "resize-text-preview" : undefined} onPointerDownCapture={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={(event) => finish(event, true)} onLostPointerCapture={(event) => finish(event, true)}>{children}</div>;
}
