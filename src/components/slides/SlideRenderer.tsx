import { ClosingTemplate } from "@/components/templates/ClosingTemplate";
import { ContentTemplate } from "@/components/templates/ContentTemplate";
import { CoverTemplate } from "@/components/templates/CoverTemplate";
import type { Asset, CarouselProject, CarouselSlide } from "@/types/carousel";

type Props = { project: CarouselProject; slide: CarouselSlide; asset?: Asset };

export function SlideRenderer({ project, slide, asset }: Props) {
  const common = { brand: project.brand.name, index: slide.order, total: project.slideCount, asset };
  if (slide.type === "cover") return <CoverTemplate slide={slide} {...common} />;
  if (slide.type === "content") return <ContentTemplate slide={slide} {...common} />;
  return <ClosingTemplate slide={slide} website={project.brand.website} {...common} />;
}
