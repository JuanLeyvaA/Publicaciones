export const SLIDE_WIDTH = 1080;
export const SLIDE_HEIGHT = 1350;
export const SAFE_AREA = { top: 70, right: 80, bottom: 70, left: 80 } as const;

export const TITLE_FONT_SIZES = [74, 68, 62, 56, 50] as const;
export const BODY_FONT_SIZES = [34, 32, 30, 28, 25] as const;

export const TEXT_LIMITS = {
  cover: { title: 58, subtitle: 90 },
  content: { title: 52, body: 180, highlight: 72 },
  closing: { title: 58, body: 130, cta: 90 },
} as const;

export const EXPORT_ROOT = "exports";
