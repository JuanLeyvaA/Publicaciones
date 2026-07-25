import type { CSSProperties } from "react";
import type { Asset, SlideType } from "@/types/carousel";

export function AssetVisual({ asset, variant }: { asset?: Asset; variant: SlideType }) {
  if (!asset) return null;
  const style = { "--asset-rotation": `${asset.rotation}deg` } as CSSProperties;
  return (
    <div
      className={`asset-visual asset-visual-${variant} asset-placement-${asset.placement} asset-scale-${asset.scale} asset-media-${asset.mediaType ?? "vector"}${asset.visualStyle ? ` asset-style-${asset.visualStyle}` : ""}`}
      data-asset-id={asset.id}
      data-asset-placement={asset.placement}
      style={style}
      aria-hidden="true"
    >
      <img src={asset.path} alt="" draggable={false} />
    </div>
  );
}
