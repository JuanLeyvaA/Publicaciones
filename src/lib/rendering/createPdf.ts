import fs from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/constants";
import { validateAllDimensions } from "@/lib/rendering/validateDimensions";

export async function createPdfFromPngs(pngPaths: string[], outputPath: string) {
  if (pngPaths.length === 0) throw new Error("No hay diapositivas para crear el PDF.");
  await validateAllDimensions(pngPaths);
  const pdf = await PDFDocument.create();
  for (const pngPath of pngPaths) {
    const image = await pdf.embedPng(await fs.readFile(pngPath));
    const page = pdf.addPage([SLIDE_WIDTH, SLIDE_HEIGHT]);
    page.drawImage(image, { x: 0, y: 0, width: SLIDE_WIDTH, height: SLIDE_HEIGHT });
  }
  await fs.writeFile(outputPath, await pdf.save());
  return outputPath;
}
