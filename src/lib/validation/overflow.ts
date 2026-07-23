import type { OverflowIssue } from "@/types/carousel";

export type ElementMeasurement = {
  name: string;
  scrollWidth: number;
  clientWidth: number;
  scrollHeight: number;
  clientHeight: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type Bounds = { left: number; top: number; right: number; bottom: number };

export function detectOverflowFromMeasurements(elements: ElementMeasurement[], canvas: Bounds, safeArea: Bounds): OverflowIssue[] {
  const issues: OverflowIssue[] = [];
  for (const item of elements) {
    if (item.scrollWidth > item.clientWidth + 1 || item.scrollHeight > item.clientHeight + 1) issues.push({ element: item.name, reason: "content-overflow" });
    if (item.left < canvas.left - 1 || item.top < canvas.top - 1 || item.right > canvas.right + 1 || item.bottom > canvas.bottom + 1) issues.push({ element: item.name, reason: "outside-canvas" });
    if (item.left < safeArea.left - 1 || item.top < safeArea.top - 1 || item.right > safeArea.right + 1 || item.bottom > safeArea.bottom + 1) issues.push({ element: item.name, reason: "outside-safe-area" });
  }
  return issues;
}
