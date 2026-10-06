// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { demoProject } from "@/data/demo-project";

const mocks = vi.hoisted(() => {
  const canvas = { count: vi.fn(), boundingBox: vi.fn(), evaluate: vi.fn(), screenshot: vi.fn() };
  const page = { goto: vi.fn(), evaluate: vi.fn(), waitForFunction: vi.fn(), locator: vi.fn(() => canvas) };
  const browser = { newPage: vi.fn(() => page), close: vi.fn() };
  return { canvas, page, browser, launch: vi.fn(() => browser), pdf: vi.fn(), dimensions: vi.fn() };
});

vi.mock("playwright", () => ({ chromium: { launch: mocks.launch } }));
vi.mock("node:fs/promises", () => ({ default: { mkdtemp: vi.fn(async () => "/tmp/kalliom-export-test"), mkdir: vi.fn(), rm: vi.fn(), copyFile: vi.fn() } }));
vi.mock("@/lib/rendering/createPdf", () => ({ createPdfFromPngs: mocks.pdf }));
vi.mock("@/lib/rendering/validateDimensions", () => ({ validateDimensions: mocks.dimensions }));

import { renderCarousel } from "@/lib/rendering/renderSlides";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.canvas.count.mockResolvedValue(1);
  mocks.canvas.boundingBox.mockResolvedValue({ width: 1080, height: 1350 });
  mocks.canvas.evaluate.mockResolvedValue([{ element: "title-body", reason: "content-overflow" }]);
  mocks.page.evaluate.mockResolvedValue(true);
  mocks.page.waitForFunction.mockResolvedValue(undefined);
});

describe("descarga con advertencias de composición", () => {
  it("genera el PDF aunque haya cruces y conserva las plantillas editadas", async () => {
    const project = structuredClone(demoProject);
    project.slides[0].appearance = { textSizes: { title: { width: 800, height: 300 } }, fontSizes: { title: 64 } };
    const result = await renderCarousel({ project, baseUrl: "http://localhost:3300", workspaceRoot: "/tmp/kalliom-export-test-root" });
    expect(result.warnings).toHaveLength(project.slides.length);
    expect(mocks.pdf).toHaveBeenCalledOnce();
    expect(mocks.canvas.screenshot).toHaveBeenCalledTimes(project.slides.length);
    expect(mocks.page.goto).toHaveBeenCalledTimes(project.slides.length);
    for (const [index, [url]] of mocks.page.goto.mock.calls.entries()) {
      expect(new URL(url).searchParams.get("template")).toBe(project.slides[index].templateId);
    }
  });

  it("mantiene la revisión visual estricta sin cambiar la composición manual", async () => {
    const project = structuredClone(demoProject);
    project.slides[0].appearance = { panelPosition: { x: 20, y: 30 } };
    await expect(renderCarousel({ project, baseUrl: "http://localhost:3300", workspaceRoot: "/tmp/kalliom-export-test-root", persist: false })).rejects.toMatchObject({ code: "SLIDE_OVERFLOW" });
    expect(mocks.page.goto).toHaveBeenCalledOnce();
    expect(mocks.pdf).not.toHaveBeenCalled();
  });

  it("sigue rechazando un canvas con dimensiones incorrectas", async () => {
    mocks.canvas.boundingBox.mockResolvedValue({ width: 500, height: 500 });
    await expect(renderCarousel({ project: demoProject, baseUrl: "http://localhost:3300", workspaceRoot: "/tmp/kalliom-export-test-root" })).rejects.toMatchObject({ code: "INVALID_SLIDE_DIMENSIONS" });
    expect(mocks.pdf).not.toHaveBeenCalled();
  });
});
