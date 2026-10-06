"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";

type Position = { x: number; y: number };
type Drag = { element: HTMLElement; elementId?: string; pointerId: number; startX: number; startY: number; position: Position; next: Position; scale: number; minX: number; maxX: number; minY: number; maxY: number };

export function DraggablePanelPreview({ children, position, onMove, mode = "panel", elementPositions = {}, onMoveElement, disabled = false }: { children: ReactNode; position: Position; onMove: (position: Position) => void; mode?: "panel" | "elements"; elementPositions?: Record<string, Position>; onMoveElement?: (id: string, position: Position) => void; disabled?: boolean }) {
  const drag = useRef<Drag | null>(null);

  function start(event: PointerEvent<HTMLDivElement>) {
    if (disabled || event.button !== 0 || drag.current) return;
    const element = (event.target as HTMLElement).closest<HTMLElement>(mode === "elements" ? "[data-movable-element]" : "[data-movable-panel]");
    const canvas = element?.closest<HTMLElement>("[data-canvas-width]");
    const safe = canvas?.querySelector<HTMLElement>("[data-safe-area]");
    if (!element || !canvas || !safe) return;
    const rect = element.getBoundingClientRect();
    const bounds = safe.getBoundingClientRect();
    const scale = canvas.getBoundingClientRect().width / Number(canvas.dataset.canvasWidth);
    const elementId = mode === "elements" ? element.dataset.movableElement : undefined;
    const origin = elementId ? elementPositions[elementId] ?? { x: 0, y: 0 } : position;
    const boundsPosition = origin;
    drag.current = { element, elementId, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, position: origin, next: origin, scale,
      minX: Math.min(boundsPosition.x, boundsPosition.x + (bounds.left - rect.left) / scale),
      maxX: Math.max(boundsPosition.x, boundsPosition.x + (bounds.right - rect.right) / scale),
      minY: Math.min(boundsPosition.y, boundsPosition.y + (bounds.top - rect.top) / scale),
      maxY: Math.max(boundsPosition.y, boundsPosition.y + (bounds.bottom - rect.bottom) / scale) };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    current.next = {
      x: Math.round(Math.min(current.maxX, Math.max(current.minX, current.position.x + (event.clientX - current.startX) / current.scale))),
      y: Math.round(Math.min(current.maxY, Math.max(current.minY, current.position.y + (event.clientY - current.startY) / current.scale))),
    };
    current.element.style.translate = `${current.next.x}px ${current.next.y}px`;
  }

  function finish(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    if (cancelled) current.element.style.translate = `${current.position.x}px ${current.position.y}px`;
    else if (current.elementId) onMoveElement?.(current.elementId, current.next);
    else onMove(current.next);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return <div className={`draggable-panel-preview${disabled ? "" : ` drag-mode-${mode}`}`} onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={(event) => finish(event, true)} onLostPointerCapture={(event) => finish(event, true)}>{children}</div>;
}
