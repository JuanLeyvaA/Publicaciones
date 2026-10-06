"use client";

import { useLayoutEffect, useRef } from "react";

type Rect = { left: number; top: number; right: number; bottom: number };

function overlaps(left: Rect, right: Rect, clearance = 2) {
  return left.left < right.right + clearance
    && left.right > right.left - clearance
    && left.top < right.bottom + clearance
    && left.bottom > right.top - clearance;
}

export function SlideAutoFit({ fitKey, manualLayout = false, fontSizes }: { fitKey: string; manualLayout?: boolean; fontSizes?: Record<string, number> }) {
  const marker = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    let cancelled = false;
    let frame = 0;

    async function fit() {
      const root = marker.current?.closest<HTMLElement>("#slide-canvas");
      if (!root) return;
      root.dataset.layoutReady = "fitting";
      await document.fonts.ready;
      if (cancelled) return;

      const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-autofit]")).filter((element) => !element.closest('[data-element-hidden="true"]'));
      if (manualLayout) {
        targets.forEach((element) => {
          const id = element.closest<HTMLElement>("[data-movable-element]")?.dataset.movableElement;
          const saved = id ? fontSizes?.[id] : undefined;
          if (saved !== undefined) element.style.fontSize = `${saved}px`;
        });
        root.dataset.layoutReady = "ready";
        return;
      }
      targets.forEach((element) => {
        const explicitBase = Number.parseFloat(element.dataset.autofitBase || "");
        if (Number.isFinite(explicitBase)) element.style.fontSize = `${explicitBase}px`;
        else element.style.removeProperty("font-size");
      });

      function shrink(element: HTMLElement) {
        const current = Number.parseFloat(getComputedStyle(element).fontSize);
        const minimum = Number.parseFloat(element.dataset.autofitMin || "18");
        if (!Number.isFinite(current) || current <= minimum + 0.25) return false;
        element.style.fontSize = `${Math.max(minimum, current - 1.5)}px`;
        return true;
      }

      function descendants(element: Element) {
        const own = element.matches("[data-autofit]") ? [element as HTMLElement] : [];
        return [...own, ...Array.from(element.querySelectorAll<HTMLElement>("[data-autofit]"))];
      }

      let unresolved = false;
      for (let pass = 0; pass < 56; pass += 1) {
        const safe = root.querySelector<HTMLElement>("[data-safe-area]")?.getBoundingClientRect() ?? root.getBoundingClientRect();
        const overflowContainers = Array.from(root.querySelectorAll<HTMLElement>("[data-overflow-check]")).filter((element) => {
          if (element.closest('[data-element-hidden="true"]')) return false;
          const rect = element.getBoundingClientRect();
          return element.scrollWidth > element.clientWidth + 1
            || element.scrollHeight > element.clientHeight + 1
            || rect.left < safe.left - 2
            || rect.top < safe.top - 2
            || rect.right > safe.right + 2
            || rect.bottom > safe.bottom + 2;
        });
        const collisionElements = Array.from(root.querySelectorAll<HTMLElement>("[data-collision-check]")).filter((element) => {
          const style = getComputedStyle(element);
          return !element.closest('[data-element-hidden="true"]') && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
        });
        const collisions: Array<[HTMLElement, HTMLElement]> = [];
        for (let left = 0; left < collisionElements.length; left += 1) {
          for (let right = left + 1; right < collisionElements.length; right += 1) {
            const a = collisionElements[left]!;
            const b = collisionElements[right]!;
            if (a.contains(b) || b.contains(a)) continue;
            if (overlaps(a.getBoundingClientRect(), b.getBoundingClientRect())) collisions.push([a, b]);
          }
        }
        if (!overflowContainers.length && !collisions.length) {
          unresolved = false;
          break;
        }

        unresolved = true;
        const candidates = new Set<HTMLElement>();
        overflowContainers.forEach((container) => descendants(container).forEach((element) => candidates.add(element)));
        collisions.forEach(([a, b]) => {
          [...descendants(a), ...descendants(b)].forEach((element) => candidates.add(element));
        });
        const ordered = [...candidates].sort((a, b) => Number.parseFloat(getComputedStyle(b).fontSize) - Number.parseFloat(getComputedStyle(a).fontSize));
        if (!ordered.some(shrink)) break;
      }
      if (unresolved) {
        const safe = root.querySelector<HTMLElement>("[data-safe-area]")?.getBoundingClientRect() ?? root.getBoundingClientRect();
        const stillOverflows = Array.from(root.querySelectorAll<HTMLElement>("[data-overflow-check]")).some((element) => {
          if (element.closest('[data-element-hidden="true"]')) return false;
          const rect = element.getBoundingClientRect();
          return element.scrollWidth > element.clientWidth + 1
            || element.scrollHeight > element.clientHeight + 1
            || rect.left < safe.left - 2
            || rect.top < safe.top - 2
            || rect.right > safe.right + 2
            || rect.bottom > safe.bottom + 2;
        });
        const visibleCollisionElements = Array.from(root.querySelectorAll<HTMLElement>("[data-collision-check]")).filter((element) => {
          const style = getComputedStyle(element);
          return !element.closest('[data-element-hidden="true"]') && style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
        });
        let stillCollides = false;
        for (let left = 0; left < visibleCollisionElements.length && !stillCollides; left += 1) {
          for (let right = left + 1; right < visibleCollisionElements.length; right += 1) {
            const a = visibleCollisionElements[left]!;
            const b = visibleCollisionElements[right]!;
            if (!a.contains(b) && !b.contains(a) && overlaps(a.getBoundingClientRect(), b.getBoundingClientRect())) {
              stillCollides = true;
              break;
            }
          }
        }
        unresolved = stillOverflows || stillCollides;
      }
      root.dataset.layoutReady = unresolved ? "exhausted" : "ready";
    }

    frame = requestAnimationFrame(() => { void fit(); });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [fitKey, manualLayout, fontSizes]);

  return <span ref={marker} className="layout-fit-marker" aria-hidden="true" />;
}
