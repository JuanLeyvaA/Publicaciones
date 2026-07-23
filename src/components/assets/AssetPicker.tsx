"use client";

import { useMemo, useState } from "react";
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
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<AssetCategory | "all">("all");
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return assets.filter((asset) => asset.active
      && (category === "all" || asset.category === category)
      && (!term || `${asset.id} ${asset.tags.join(" ")}`.toLowerCase().includes(term)));
  }, [assets, category, query]);
  const selected = assets.find((asset) => asset.id === selectedId);

  return (
    <details className="asset-picker">
      <summary>
        <span>{selected ? <img src={selected.path} alt="" /> : null}</span>
        <div><small>Asset visual</small><strong>{selected?.id ?? "Sin asignar"}</strong></div>
        <b>Cambiar</b>
      </summary>
      <div className="asset-picker-panel">
        <div className="asset-filters">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por etiqueta…" aria-label="Buscar assets" />
          <select value={category} onChange={(event) => setCategory(event.target.value as AssetCategory | "all")} aria-label="Filtrar por categoría">
            {Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="asset-options">
          {filtered.map((asset) => (
            <button key={asset.id} type="button" className={asset.id === selectedId ? "selected" : ""} onClick={() => onSelect(asset.id)}>
              <img src={asset.path} alt="" /><span>{asset.id}</span>
            </button>
          ))}
          {!filtered.length && <p>No hay assets compatibles con la búsqueda.</p>}
        </div>
      </div>
    </details>
  );
}
