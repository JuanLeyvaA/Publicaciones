export type SlideType = "cover" | "content" | "closing";
export type TemplateId =
  | "cover"
  | "cover-split"
  | "cover-poster"
  | "cover-minimal"
  | "cover-frame"
  | "content"
  | "content-focus"
  | "content-steps"
  | "content-quote"
  | "content-data"
  | "closing"
  | "closing-minimal"
  | "closing-panel"
  | "closing-question"
  | "closing-brand";
export type AssetCategory = "automation" | "web" | "artificial-intelligence" | "analytics" | "business";
export type AssetOrientation = "vertical" | "horizontal" | "square";
export type AssetPlacement = "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
export type AssetScale = "compact" | "standard" | "large";
export type EditorialStatus = "idea" | "review" | "approved" | "scheduled" | "published";
export type EditorialProfileId = "kalliom-professional" | "educator" | "opinion" | "executive" | "case-study";
export type VisualStyle = "balanced" | "minimal" | "bold" | "image-led" | "text-led";

export type QualityIssue = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  slideId?: string;
};

export type QualityReport = {
  score: number;
  issues: QualityIssue[];
  checkedAt: string;
};

export type Asset = {
  id: string;
  name: string;
  motif: string;
  path: string;
  category: AssetCategory;
  tags: string[];
  orientation: AssetOrientation;
  transparent: boolean;
  compatibleLayouts: SlideType[];
  placement: AssetPlacement;
  scale: AssetScale;
  rotation: number;
  mediaType?: "vector" | "raster";
  visualStyle?: string;
  active: boolean;
};

type SlideBase = {
  id: string;
  type: SlideType;
  order: number;
  visualTags: string[];
  templateId: TemplateId;
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
  editorialStatus: EditorialStatus;
  editorialProfile: EditorialProfileId;
  visualStyle: VisualStyle;
  scheduledAt?: string;
  batchId?: string;
  qualityReport: QualityReport;
  brand: { name: string; website: string };
  slides: CarouselSlide[];
  linkedInCopy: string;
};

export type OverflowIssue = {
  element: string;
  reason: "content-overflow" | "outside-canvas" | "outside-safe-area";
};
