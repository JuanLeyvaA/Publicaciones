import type { CarouselProject } from "@/types/carousel";

export const demoProject: CarouselProject = {
  id: "kalliom-demo",
  topic: "Automatización para pymes",
  title: "El trabajo que vuelve cada lunes",
  subtitle: "Tres pistas para decidir qué automatizar primero",
  slideCount: 5,
  category: "automation",
  language: "es",
  tone: "professional",
  status: "approved",
  editorialStatus: "approved",
  editorialProfile: "kalliom-professional",
  visualStyle: "balanced",
  contentState: "new",
  qualityReport: { score: 100, issues: [], checkedAt: "2026-01-01T00:00:00.000Z" },
  brand: { name: "Kalliom", website: "kalliom.com" },
  slides: [
    {
      id: "cover", type: "cover", order: 0, templateId: "cover",
      title: "El trabajo que vuelve cada lunes",
      subtitle: "Tres pistas para decidir qué automatizar primero",
      visualTags: ["automation", "business", "workflow"],
    },
    {
      id: "content-1", type: "content", order: 1, number: 1, templateId: "content",
      title: "La misma pregunta, otra vez",
      body: "Si el equipo copia la misma respuesta cada mañana, el problema no es la velocidad: esa pregunta todavía no tiene un lugar fijo donde resolverse.",
      highlight: "Primero ordena la respuesta. Después automatízala.",
      visualTags: ["chatbot", "customer-service", "automation"],
    },
    {
      id: "content-2", type: "content", order: 2, number: 2, templateId: "content",
      title: "El correo que nadie reclamó",
      body: "Un formulario, un correo y una nota de WhatsApp pueden hablar del mismo prospecto. Si nadie sabe quién responde, el seguimiento empieza tarde.",
      highlight: "Automatiza el traspaso, no la relación.",
      visualTags: ["sales", "workflow", "business"],
    },
    {
      id: "content-3", type: "content", order: 3, number: 3, templateId: "content",
      title: "El informe llega cuando ya pasó",
      body: "Hay reportes que solo confirman lo que el equipo ya sospechaba. Vale automatizar los que avisan antes de que una decisión quede cerrada.",
      highlight: "Una alerta útil llega con margen para elegir.",
      visualTags: ["analytics", "dashboard", "automation"],
    },
    {
      id: "closing", type: "closing", order: 4, templateId: "closing",
      title: "Empieza donde se repite el atasco",
      body: "No busques el proceso más vistoso. Busca el que obliga a alguien a copiar, perseguir o preguntar lo mismo cada semana.",
      cta: "¿Qué tarea vuelve a tu equipo al punto de partida cada lunes?",
      visualTags: ["business", "connection", "automation"],
    },
  ],
  linkedInCopy: "Hay tareas que parecen pequeñas hasta que vuelven cada lunes.\n\nUna respuesta copiada, un correo sin dueño o un informe que llega tarde no siempre requieren una gran transformación. A veces piden una regla clara y un traspaso bien diseñado.\n\n¿Qué tarea hace que tu equipo empiece la semana desde el mismo punto?\n\n#Automatización #Pymes #Operaciones",
  referenceImageUrls: [],
};

export function getDemoSlide(slideId: string) {
  return demoProject.slides.find((slide) => slide.id === slideId);
}
