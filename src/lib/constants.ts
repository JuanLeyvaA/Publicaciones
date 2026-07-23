export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;
export const SAFE_AREA = { top: 70, right: 80, bottom: 70, left: 80 } as const;

export const TITLE_FONT_SIZES = [74, 68, 62, 56] as const;
export const BODY_FONT_SIZES = [34, 32, 30, 28] as const;

export const TEXT_LIMITS = {
  cover: { title: 70, subtitle: 110 },
  content: { title: 55, body: 180, highlight: 90 },
  closing: { title: 75, body: 150, cta: 100 },
} as const;

export const EXPORT_ROOT = "exports";
