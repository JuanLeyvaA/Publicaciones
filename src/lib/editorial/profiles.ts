import type { EditorialProfileId } from "@/types/carousel";

export type EditorialProfile = {
  id: EditorialProfileId;
  label: string;
  description: string;
  prompt: string;
};

export const editorialProfiles: EditorialProfile[] = [
  {
    id: "kalliom-professional",
    label: "Kalliom profesional",
    description: "Claro, cercano y orientado a decisiones.",
    prompt: "Escribe con autoridad tranquila, claridad y utilidad práctica. Evita sonar promocional.",
  },
  {
    id: "educator",
    label: "Educativo",
    description: "Explica conceptos complejos con sencillez.",
    prompt: "Enseña paso a paso sin infantilizar. Usa ejemplos concretos y una conclusión aplicable.",
  },
  {
    id: "opinion",
    label: "Opinión",
    description: "Punto de vista firme y argumentado.",
    prompt: "Toma una postura clara, reconoce el matiz y explica por qué la opinión importa en la práctica.",
  },
  {
    id: "executive",
    label: "Ejecutivo",
    description: "Breve, estratégico y centrado en impacto.",
    prompt: "Prioriza decisiones, riesgos, consecuencias y resultados. Elimina explicaciones accesorias.",
  },
  {
    id: "case-study",
    label: "Caso de negocio",
    description: "Situación, intervención y aprendizaje.",
    prompt: "Organiza la narrativa como situación, tensión, cambio y aprendizaje. No inventes clientes ni métricas.",
  },
];

export function getEditorialProfile(id?: string) {
  return editorialProfiles.find((profile) => profile.id === id) ?? editorialProfiles[0]!;
}
