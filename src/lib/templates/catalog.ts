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
  { id: "cover-sidebar", type: "cover", label: "Portada lateral", description: "Titular vertical con visual protagonista al costado." },
  { id: "cover-stack", type: "cover", label: "Portada apilada", description: "Jerarquía editorial construida en tres niveles." },
  { id: "cover-diagonal", type: "cover", label: "Portada diagonal", description: "Composición dinámica con tensión entre texto y fondo." },
  { id: "cover-grid", type: "cover", label: "Retícula luminosa", description: "Titular modular sobre una retícula técnica profunda." },
  { id: "cover-spotlight", type: "cover", label: "Escenario focal", description: "Una luz central concentra la atención en el mensaje." },
  { id: "cover-terminal", type: "cover", label: "Terminal ejecutiva", description: "Ventana tecnológica con estructura de interfaz." },
  { id: "cover-bento", type: "cover", label: "Mosaico bento", description: "Bloques editoriales asimétricos con ritmo modular." },
  { id: "cover-ribbon", type: "cover", label: "Cinta diagonal", description: "Una franja de color divide texto y visual." },
  { id: "cover-portal", type: "cover", label: "Portal concéntrico", description: "Anillos de luz enmarcan una portada inmersiva." },
  { id: "cover-editorial", type: "cover", label: "Editorial de lujo", description: "Composición tipográfica sobria con banda de marca." },
  { id: "cover-wave", type: "cover", label: "Onda envolvente", description: "Curvas amplias conectan texto e imagen sin paneles rectos." },
  { id: "cover-typographic", type: "cover", label: "Tipografía monumental", description: "El titular domina como elemento gráfico principal." },
  { id: "cover-collage", type: "cover", label: "Collage creativo", description: "Capas, círculos y visual recortado con ritmo experimental." },
  { id: "cover-arch", type: "cover", label: "Arco editorial", description: "El contenido se integra dentro de una gran silueta arqueada." },
  { id: "cover-radar", type: "cover", label: "Radar estratégico", description: "Lectura técnica sobre barridos y coordenadas circulares." },
  { id: "cover-staircase", type: "cover", label: "Escalera de ideas", description: "El mensaje asciende mediante planos escalonados." },
  { id: "content", type: "content", label: "Contenido balanceado", description: "Texto y visual con el mismo peso." },
  { id: "content-focus", type: "content", label: "Contenido enfocado", description: "Más espacio para la idea y el destacado." },
  { id: "content-steps", type: "content", label: "Secuencia vertical", description: "Número y contenido organizados como proceso." },
  { id: "content-quote", type: "content", label: "Idea protagonista", description: "El destacado toma el centro de la página." },
  { id: "content-data", type: "content", label: "Panel inverso", description: "Visual a la izquierda y argumento a la derecha." },
  { id: "content-cards", type: "content", label: "Tarjetas editoriales", description: "Argumento y destacado organizados como módulos." },
  { id: "content-timeline", type: "content", label: "Línea de progreso", description: "Lectura horizontal con sensación de avance." },
  { id: "content-magazine", type: "content", label: "Revista tecnológica", description: "Asimetría editorial con columna visual estrecha." },
  { id: "content-blueprint", type: "content", label: "Plano técnico", description: "Argumento sobre una cuadrícula de blueprint." },
  { id: "content-console", type: "content", label: "Consola operativa", description: "Contenido organizado como una interfaz de control." },
  { id: "content-duo", type: "content", label: "Doble columna", description: "Título, explicación y conclusión en dos planos claros." },
  { id: "content-rings", type: "content", label: "Anillos de enfoque", description: "Lectura central rodeada por círculos de progreso." },
  { id: "content-dashboard", type: "content", label: "Dashboard editorial", description: "Idea principal y destacado en módulos de datos." },
  { id: "content-index", type: "content", label: "Índice gigante", description: "La numeración domina la jerarquía visual." },
  { id: "content-spotlight", type: "content", label: "Idea iluminada", description: "Un foco de luz separa argumento y conclusión." },
  { id: "content-wave", type: "content", label: "Argumento en onda", description: "Texto y visual se reparten mediante una curva orgánica." },
  { id: "content-radial", type: "content", label: "Lectura radial", description: "La idea clave ocupa el centro de un sistema circular." },
  { id: "content-staircase", type: "content", label: "Progreso escalonado", description: "La lectura avanza en niveles con una gran numeración." },
  { id: "content-poster", type: "content", label: "Póster de idea", description: "Tipografía contundente y conclusión como firma inferior." },
  { id: "content-circuit", type: "content", label: "Circuito de decisiones", description: "Líneas y nodos tecnológicos conectan el argumento." },
  { id: "content-collage", type: "content", label: "Collage explicativo", description: "Visual protagonista con textos flotantes y formas recortadas." },
  { id: "closing", type: "closing", label: "Cierre emblemático", description: "Logo, mensaje y CTA centrados." },
  { id: "closing-minimal", type: "closing", label: "Cierre minimalista", description: "CTA directo con menor carga visual." },
  { id: "closing-panel", type: "closing", label: "Cierre en panel", description: "Mensaje y CTA dentro de una tarjeta amplia." },
  { id: "closing-question", type: "closing", label: "Cierre pregunta", description: "La conversación y el CTA dominan el cierre." },
  { id: "closing-brand", type: "closing", label: "Cierre de marca", description: "Firma visual de alto contraste." },
  { id: "closing-split", type: "closing", label: "Cierre dividido", description: "Mensaje a un lado y llamada a la acción al otro." },
  { id: "closing-banner", type: "closing", label: "Cierre manifiesto", description: "Franja contundente para una conclusión memorable." },
  { id: "closing-orbit", type: "closing", label: "Cierre orbital", description: "Composición central con marca y energía circular." },
  { id: "closing-stamp", type: "closing", label: "Sello de conclusión", description: "Firma circular y CTA con carácter editorial." },
  { id: "closing-window", type: "closing", label: "Ventana final", description: "El cierre vive dentro de una interfaz tecnológica." },
  { id: "closing-horizon", type: "closing", label: "Horizonte", description: "Mensaje elevado sobre una línea de luz." },
  { id: "closing-grid", type: "closing", label: "Retícula de acción", description: "CTA modular con fondo técnico y preciso." },
  { id: "closing-card", type: "closing", label: "Tarjeta premium", description: "Una tarjeta flotante concentra todo el cierre." },
  { id: "closing-signal", type: "closing", label: "Señal expansiva", description: "Ondas visuales convierten el CTA en el punto focal." },
  { id: "closing-editorial", type: "closing", label: "Contraportada", description: "Cierre tipográfico inspirado en una revista." },
  { id: "closing-wave", type: "closing", label: "Cierre en onda", description: "Una gran curva de color conduce hacia el CTA." },
  { id: "closing-arch", type: "closing", label: "Puerta de salida", description: "El cierre vive dentro de un arco monumental." },
  { id: "closing-radar", type: "closing", label: "Radar de acción", description: "El CTA aparece como el objetivo de un sistema de radar." },
  { id: "closing-ticket", type: "closing", label: "Ticket de acción", description: "Una pieza recortada y perforada contiene la conclusión." },
  { id: "closing-poster", type: "closing", label: "Manifiesto tipográfico", description: "Conclusión de gran formato con CTA mínimo." },
  { id: "closing-collage", type: "closing", label: "Collage final", description: "Formas orgánicas, visual y marca cierran en capas." },
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
