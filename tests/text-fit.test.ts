import { describe, expect, it } from "vitest";
import { BODY_FONT_SIZES, TITLE_FONT_SIZES } from "@/lib/constants";
import { bodyFontSize, titleFontSize } from "@/lib/text-fit";

describe("ajuste local de tipografía", () => {
  it("solo usa tamaños de título permitidos", () => {
    for (const length of [10, 30, 42, 70]) expect(TITLE_FONT_SIZES).toContain(titleFontSize("x".repeat(length), "cover"));
  });
  it("solo usa tamaños de cuerpo permitidos", () => {
    for (const length of [40, 90, 130, 180]) expect(BODY_FONT_SIZES).toContain(bodyFontSize("x".repeat(length)));
  });
});
