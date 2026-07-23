// @vitest-environment node
import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("frontera de consumo", () => {
  it("la reexportación no importa ni llama el motor de IA", async () => {
    const source = await fs.readFile(path.resolve("src/app/api/projects/[projectId]/export/route.ts"), "utf8");
    expect(source).not.toMatch(/OpenAI|getOrGenerateCarousel|generateCarousel/);
    expect(source).toMatch(/renderCarousel/);
  });
});
