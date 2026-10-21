import { readFileSync } from "node:fs";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const stylesheet = postcss.parse(readFileSync("src/app/art-directions.css", "utf8"));

describe("escala de fotos usadas como fondo", () => {
  for (const direction of ["photo-essay", "cinematic"]) {
    it(`respeta el tamaño y encuadre elegidos en ${direction}`, () => {
      const declarations: Record<string, string> = {};
      stylesheet.walkRules(`.art-direction-${direction} .asset-media-raster`, (rule) => {
        rule.walkDecls((declaration) => { declarations[declaration.prop] = declaration.value; });
      });
      expect(declarations.transform).toContain("scale(var(--asset-scale))");
      expect(declarations.transform).toContain("rotate(var(--asset-rotation))");
      stylesheet.walkRules(`.art-direction-${direction} .asset-media-raster img`, (rule) => {
        rule.walkDecls("object-fit", (declaration) => { expect(declaration.important).toBeFalsy(); });
      });
    });
  }
});
