import { describe, expect, it } from "vitest";
import { detectOverflowFromMeasurements } from "@/lib/validation/overflow";

const canvas = { left: 0, top: 0, right: 1080, bottom: 1350 };
const safe = { left: 80, top: 70, right: 1000, bottom: 1280 };

describe("detección de overflow", () => {
  it("no reporta elementos contenidos", () => {
    const issues = detectOverflowFromMeasurements([{ name: "title", scrollWidth: 400, clientWidth: 400, scrollHeight: 80, clientHeight: 80, left: 100, top: 100, right: 500, bottom: 180 }], canvas, safe);
    expect(issues).toEqual([]);
  });
  it("reporta contenido recortado y salida del área segura", () => {
    const issues = detectOverflowFromMeasurements([{ name: "title", scrollWidth: 430, clientWidth: 400, scrollHeight: 100, clientHeight: 80, left: 40, top: 100, right: 440, bottom: 180 }], canvas, safe);
    expect(issues.map((issue) => issue.reason)).toEqual(["content-overflow", "outside-safe-area"]);
  });
});
