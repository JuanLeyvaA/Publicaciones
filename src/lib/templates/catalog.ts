import type { SlideType, TemplateId } from "@/types/carousel";

export type TemplateOption = {
  id: TemplateId;
  type: SlideType;
  label: string;
  description: string;
};

export const templateCatalog: TemplateOption[] = [
  { id: "cover", type: "cover", label: "Portada editorial", description: "Copy protagonista con visual atmosférico." },
  { id: "cover-split", type: "cover", label: "Portada dividida", description: "Composición compacta con panel visual." },
  { id: "cover-poster", type: "cover", label: "Póster central", description: "Titular centrado con presencia de cartel." },
  { id: "cover-minimal", type: "cover", label: "Portada aire", description: "Mucho espacio negativo y mensaje preciso." },
  { id: "cover-frame", type: "cover", label: "Portada enmarcada", description: "Copy contenido en un marco editorial." },
  { id: "content", type: "content", label: "Contenido balanceado", description: "Texto y visual con el mismo peso." },
  { id: "content-focus", type: "content", label: "Contenido enfocado", description: "Más espacio para la idea y el destacado." },
  { id: "content-steps", type: "content", label: "Secuencia vertical", description: "Número y contenido organizados como proceso." },
  { id: "content-quote", type: "content", label: "Idea protagonista", description: "El destacado toma el centro de la página." },
  { id: "content-data", type: "content", label: "Panel inverso", description: "Visual a la izquierda y argumento a la derecha." },
  { id: "closing", type: "closing", label: "Cierre emblemático", description: "Logo, mensaje y CTA centrados." },
  { id: "closing-minimal", type: "closing", label: "Cierre minimalista", description: "CTA directo con menor carga visual." },
  { id: "closing-panel", type: "closing", label: "Cierre en panel", description: "Mensaje y CTA dentro de una tarjeta amplia." },
  { id: "closing-question", type: "closing", label: "Cierre pregunta", description: "La conversación y el CTA dominan el cierre." },
  { id: "closing-brand", type: "closing", label: "Cierre de marca", description: "Firma visual de alto contraste." },
];

export function templatesForType(type: SlideType) {
  return templateCatalog.filter((template) => template.type === type);
}

export function isTemplateCompatible(type: SlideType, templateId: string): templateId is TemplateId {
  return templateCatalog.some((template) => template.type === type && template.id === templateId);
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function selectTemplateId(type: SlideType, projectId: string, order: number): TemplateId {
  const options = templatesForType(type);
  const seed = stableHash(`${projectId}:${type}`);
  const offset = type === "content" ? Math.max(order - 1, 0) : order;
  return options[(seed + offset) % options.length]!.id;
}
