export class RenderError extends Error {
  constructor(public readonly code: "INVALID_SLIDE_DIMENSIONS" | "SLIDE_OVERFLOW" | "ASSET_NOT_LOADED" | "CANVAS_NOT_FOUND", message: string) {
    super(message);
    this.name = "RenderError";
  }
}
