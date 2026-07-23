import { BODY_FONT_SIZES, TITLE_FONT_SIZES } from "@/lib/constants";

export function titleFontSize(text: string, kind: "cover" | "content" | "closing") {
  const thresholds = kind === "content" ? [25, 36, 46] : [34, 48, 61];
  if (text.length <= thresholds[0]) return TITLE_FONT_SIZES[0];
  if (text.length <= thresholds[1]) return TITLE_FONT_SIZES[1];
  if (text.length <= thresholds[2]) return TITLE_FONT_SIZES[2];
  return TITLE_FONT_SIZES[3];
}

export function bodyFontSize(text: string) {
  if (text.length <= 70) return BODY_FONT_SIZES[0];
  if (text.length <= 110) return BODY_FONT_SIZES[1];
  if (text.length <= 150) return BODY_FONT_SIZES[2];
  return BODY_FONT_SIZES[3];
}

export function titleLineHeight(size: number) {
  return size <= 56 ? 0.98 : size <= 62 ? 0.96 : 0.93;
}
