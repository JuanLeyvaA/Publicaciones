import { BODY_FONT_SIZES, TITLE_FONT_SIZES } from "@/lib/constants";

export function titleFontSize(text: string, kind: "cover" | "content" | "closing") {
  const thresholds = kind === "content" ? [25, 36, 46, 60] : [34, 48, 61, 78];
  if (text.length <= thresholds[0]) return TITLE_FONT_SIZES[0];
  if (text.length <= thresholds[1]) return TITLE_FONT_SIZES[1];
  if (text.length <= thresholds[2]) return TITLE_FONT_SIZES[2];
  if (text.length <= thresholds[3]) return TITLE_FONT_SIZES[3];
  return TITLE_FONT_SIZES[4];
}

export function bodyFontSize(text: string) {
  if (text.length <= 70) return BODY_FONT_SIZES[0];
  if (text.length <= 110) return BODY_FONT_SIZES[1];
  if (text.length <= 150) return BODY_FONT_SIZES[2];
  if (text.length <= 205) return BODY_FONT_SIZES[3];
  return BODY_FONT_SIZES[4];
}

export function titleLineHeight(size: number) {
  return size <= 50 ? 1.02 : size <= 56 ? 0.98 : size <= 62 ? 0.96 : 0.93;
}
