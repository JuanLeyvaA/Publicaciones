import type { CSSProperties } from "react";
import type { Asset, SlideType, SlideAppearance } from "@/types/carousel";

export function AssetVisual({ asset, variant, appearance }: { asset?: Asset; variant: SlideType; appearance?: SlideAppearance }) {
  if (!asset) return null;
  const editing = appearance?.assetEditing;
  const position = appearance?.elementPositions?.asset;
  const style = {
    "--asset-rotation": `${editing?.rotation ?? asset.rotation}deg`,
    ...(editing?.scale !== undefined ? { "--asset-scale": editing.scale } : {}),
    ...(editing?.opacity !== undefined ? { opacity: editing.opacity, "--asset-opacity": editing.opacity } : {}),
    ...(position ? { translate: `${position.x}px ${position.y}px` } : {}),
    ...(editing?.fullPhoto ? { clipPath: "none" } : {}),
  } as CSSProperties;
  return (
    <div
      className={`asset-visual asset-visual-${variant} asset-placement-${asset.placement} asset-scale-${asset.scale} asset-media-${asset.mediaType ?? "vector"}${asset.visualStyle ? ` asset-style-${asset.visualStyle}` : ""}`}
      data-asset-id={asset.id}
      data-asset-opacity={editing?.opacity}
      data-selectable-element="asset"
      data-movable-element="asset"
      data-asset-placement={asset.placement}
      style={style}
      aria-hidden="true"
    >
      <img src={asset.path} alt="" draggable={false} style={{ objectFit: editing?.fit, ...(editing?.fullPhoto ? { maskImage: "none", WebkitMaskImage: "none", borderRadius: 0 } : {}) }} />
    </div>
  );
}
