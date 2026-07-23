import type { Asset, SlideType } from "@/types/carousel";

export function AssetVisual({ asset, variant }: { asset?: Asset; variant: SlideType }) {
  if (!asset) return null;
  return (
    <div className={`asset-visual asset-visual-${variant}`} data-asset-id={asset.id} aria-hidden="true">
      <img src={asset.path} alt="" draggable={false} />
    </div>
  );
}
