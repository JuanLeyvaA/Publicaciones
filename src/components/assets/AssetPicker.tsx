"use client";

import { useMemo, useRef, useState } from "react";
import type { Asset, AssetCategory } from "@/types/carousel";

const categoryLabels: Record<AssetCategory | "all", string> = {
  all: "Todas",
  automation: "Automatización",
  web: "Web",
  "artificial-intelligence": "IA",
  analytics: "Analítica",
  business: "Negocios",
};

type Props = {
  assets: Asset[];
  selectedId?: string;
  onSelect: (assetId: string) => void;
};

export function AssetPicker({ assets, selectedId, onSelect }: Props) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return assets.filter((asset) => asset.active
      && (category === "all" || asset.category === category)
      && (!term || `${asset.id} ${asset.name} ${asset.motif} ${asset.tags.join(" ")}`.toLowerCase().includes(term)));
  }, [assets, category, query]);
  const selected = assets.find((asset) => asset.id === selectedId);
  const displayName = (value?: string) => value
    ? value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Sin visual";

  return (
    <details ref={detailsRef} className="asset-picker">
      <summary>
        <span>{selected ? <img src={selected.path} alt="" /> : null}</span>
        <div><small>Visual recomendado</small><strong>{displayName(selected?.name)}</strong></div>
        <b>Elegir</b>
      </summary>
      <div className="asset-picker-panel">
        <p className="asset-picker-intro">Selección curada para esta página · {filtered.length} opciones</p>
        <div className="asset-filters">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar robot, equipo, datos…" aria-label="Buscar visuales" />
          <select value={category} onChange={(event) => setCategory(event.target.value as AssetCategory | "all")} aria-label="Filtrar por categoría">
            {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="asset-options">
          {filtered.map((asset) => (
            <button key={asset.id} type="button" className={`${asset.id === selectedId ? "selected " : ""}${asset.mediaType === "raster" ? "raster-option" : "vector-option"}`} onClick={() => {
              onSelect(asset.id);
              if (detailsRef.current) detailsRef.current.open = false;
            }}>
              <img src={asset.path} alt="" /><span title={displayName(asset.name)}>{displayName(asset.name)}</span>
            </button>
          ))}
          {!filtered.length && <p>No encontramos un visual con esos filtros.</p>}
        </div>
      </div>
    </details>
  );
}
