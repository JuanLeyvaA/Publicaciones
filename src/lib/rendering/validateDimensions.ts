import sharp from "sharp";
import { SLIDE_HEIGHT, SLIDE_WIDTH } from "@/lib/constants";
import { RenderError } from "@/lib/rendering/errors";

export async function validateDimensions(filePath: string) {
  const metadata = await sharp(filePath).metadata();
  if (metadata.format !== "png" || metadata.width !== SLIDE_WIDTH || metadata.height !== SLIDE_HEIGHT) {
    throw new RenderError("INVALID_SLIDE_DIMENSIONS", `${filePath} mide ${metadata.width ?? "?"}×${metadata.height ?? "?"}; se requieren ${SLIDE_WIDTH}×${SLIDE_HEIGHT}.`);
  }
  return { width: metadata.width, height: metadata.height, format: metadata.format };
}

export async function validateAllDimensions(paths: string[]) {
  return Promise.all(paths.map(validateDimensions));
}
