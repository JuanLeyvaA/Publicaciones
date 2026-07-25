import type { CarouselProject } from "@/types/carousel";

export const demoProject: CarouselProject = {
  id: "kalliom-demo",
  topic: "Automatización para pymes",
  title: "5 procesos que una pyme debería automatizar",
  subtitle: "Menos tareas repetitivas, más tiempo para crecer",
  slideCount: 5,
  category: "automation",
  language: "es",
  tone: "professional",
  status: "approved",
  editorialStatus: "approved",
  editorialProfile: "kalliom-professional",
  visualStyle: "balanced",
  qualityReport: { score: 100, issues: [], checkedAt: "2026-01-01T00:00:00.000Z" },
  brand: { name: "Kalliom", website: "kalliom.com" },
  slides: [
    {
      id: "cover", type: "cover", order: 0, templateId: "cover",
      title: "5 procesos que una pyme debería automatizar",
      subtitle: "Menos tareas repetitivas, más tiempo para crecer",
      visualTags: ["automation", "business", "workflow"],
    },
    {
      id: "content-1", type: "content", order: 1, number: 1, templateId: "content",
      title: "Responder preguntas frecuentes",
      body: "Automatizar respuestas básicas reduce tiempos de espera y libera al equipo para conversaciones de mayor valor.",
      highlight: "La atención rápida mejora la experiencia.",
      visualTags: ["chatbot", "customer-service", "automation"],
    },
    {
      id: "content-2", type: "content", order: 2, number: 2, templateId: "content",
      title: "Organizar prospectos automáticamente",
      body: "Centralizar formularios, correos y seguimientos evita oportunidades perdidas y ofrece una visión clara del proceso comercial.",
      highlight: "Cada contacto llega al lugar correcto.",
      visualTags: ["sales", "workflow", "business"],
    },
    {
      id: "content-3", type: "content", order: 3, number: 3, templateId: "content",
      title: "Convertir datos en decisiones",
      body: "Los reportes automáticos eliminan consolidaciones manuales y permiten detectar cambios importantes mientras todavía se puede actuar.",
      highlight: "Menos hojas de cálculo. Más claridad.",
      visualTags: ["analytics", "dashboard", "automation"],
    },
    {
      id: "closing", type: "closing", order: 4, templateId: "closing",
      title: "Automatizar no significa perder el trato humano",
      body: "Significa dedicar a las personas a las conversaciones que realmente necesitan criterio, empatía y creatividad.",
      cta: "¿Qué proceso automatizarías primero?",
      visualTags: ["business", "connection", "automation"],
    },
  ],
  linkedInCopy: "Muchas empresas siguen usando tiempo valioso en tareas repetitivas.\n\nEstos son procesos que pueden simplificarse sin perder el control ni el trato humano.\n\n¿Qué proceso automatizarías primero?\n\n#Automatización #Pymes #TransformaciónDigital",
};

export function getDemoSlide(slideId: string) {
  return demoProject.slides.find((slide) => slide.id === slideId);
}
