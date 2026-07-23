// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, describe, expect, it } from "vitest";
import { createPdfFromPngs } from "@/lib/rendering/createPdf";
import { validateDimensions } from "@/lib/rendering/validateDimensions";

const directories: string[] = [];
async function tempDir() { const directory = await fs.mkdtemp(path.join(os.tmpdir(), "kalliom-test-")); directories.push(directory); return directory; }
afterEach(async () => { await Promise.all(directories.splice(0).map((directory) => fs.rm(directory, { recursive: true, force: true }))); });

describe("exportación estricta", () => {
  it("valida las dimensiones reales de un PNG", async () => {
    const directory = await tempDir();
    const file = path.join(directory, "valid.png");
    await sharp({ create: { width: 1080, height: 1350, channels: 4, background: "#08070d" } }).png().toFile(file);
    await expect(validateDimensions(file)).resolves.toMatchObject({ width: 1080, height: 1350, format: "png" });
  });

  it("cancela el PDF cuando una imagen tiene dimensiones inválidas", async () => {
    const directory = await tempDir();
    const invalid = path.join(directory, "invalid.png");
    const pdf = path.join(directory, "should-not-exist.pdf");
    await sharp({ create: { width: 1080, height: 1080, channels: 4, background: "#08070d" } }).png().toFile(invalid);
    await expect(createPdfFromPngs([invalid], pdf)).rejects.toMatchObject({ code: "INVALID_SLIDE_DIMENSIONS" });
    await expect(fs.access(pdf)).rejects.toThrow();
  });
});
