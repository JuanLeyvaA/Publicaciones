export type SlideType = "cover" | "content" | "closing";
export type AssetCategory = "automation" | "web" | "artificial-intelligence" | "analytics" | "business";
export type AssetOrientation = "vertical" | "horizontal" | "square";

export type Asset = {
  id: string;
  path: string;
  category: AssetCategory;
  tags: string[];
  orientation: AssetOrientation;
  transparent: boolean;
  compatibleLayouts: SlideType[];
  active: boolean;
};

type SlideBase = {
  id: string;
  type: SlideType;
  order: number;
  visualTags: string[];
  templateId: SlideType;
  assetId?: string;
};

export type CoverSlide = SlideBase & {
  type: "cover";
  title: string;
  subtitle: string;
};

export type ContentSlide = SlideBase & {
  type: "content";
  number: number;
  title: string;
  body: string;
  highlight: string;
};

export type ClosingSlide = SlideBase & {
  type: "closing";
  title: string;
  body: string;
  cta: string;
};

export type CarouselSlide = CoverSlide | ContentSlide | ClosingSlide;

export type CarouselProject = {
  id: string;
  topic: string;
  title: string;
  subtitle: string;
  slideCount: number;
  category: AssetCategory;
  language: "es" | "en";
  tone: "educational" | "direct" | "professional";
  status: "draft" | "generated" | "approved" | "exported";
  brand: { name: string; website: string };
  slides: CarouselSlide[];
  linkedInCopy: string;
};

export type OverflowIssue = {
  element: string;
  reason: "content-overflow" | "outside-canvas" | "outside-safe-area";
};
