import type { SlideAppearance } from "@/types/carousel";

export function hasManualLayout(appearance?: SlideAppearance) {
  return Boolean(appearance?.panelPosition?.x || appearance?.panelPosition?.y
    || Object.keys(appearance?.elementPositions ?? {}).length
    || Object.keys(appearance?.textSizes ?? {}).length
    || Object.keys(appearance?.fontSizes ?? {}).length);
}
