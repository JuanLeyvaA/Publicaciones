import fs from "node:fs/promises";
import path from "node:path";

const output = path.resolve("public/assets/library");
const manifestPath = path.resolve("src/data/assets-manifest.json");

const categories = [
  {
    category: "automation",
    file: "automation",
    accent: "#f4a62f",
    secondary: "#a76cf6",
    concepts: [
      ["workflow-orbit", "network", ["workflow", "integration", "process"]],
      ["robotic-arm", "robot", ["robot", "manufacturing", "automation"]],
      ["connected-gears", "gears", ["operations", "efficiency", "system"]],
      ["process-pipeline", "pipeline", ["pipeline", "workflow", "speed"]],
      ["smart-chat", "chat", ["chatbot", "customer-service", "communication"]],
      ["automation-calendar", "calendar", ["planning", "scheduling", "operations"]],
      ["cloud-sync", "cloud", ["cloud", "integration", "sync"]],
      ["secure-flow", "shield", ["security", "workflow", "control"]],
      ["task-board", "cards", ["tasks", "planning", "productivity"]],
      ["trigger-bolt", "bolt", ["trigger", "speed", "action"]],
      ["conveyor-system", "factory", ["manufacturing", "process", "operations"]],
      ["api-connections", "api", ["api", "integration", "system"]],
      ["decision-tree", "tree", ["decision", "workflow", "logic"]],
      ["email-sequence", "mail", ["email", "marketing", "sequence"]],
      ["document-flow", "documents", ["documents", "process", "approval"]],
      ["automation-hub", "hub", ["system", "orchestration", "connection"]],
      ["timer-cycle", "timer", ["time", "efficiency", "repeat"]],
      ["data-transfer", "arrows", ["data", "transfer", "integration"]],
      ["quality-check", "checklist", ["quality", "control", "operations"]],
      ["no-code-builder", "blocks", ["no-code", "builder", "workflow"]],
    ],
  },
  {
    category: "web",
    file: "web",
    accent: "#a76cf6",
    secondary: "#f4a62f",
    concepts: [
      ["browser-layout", "browser", ["website", "interface", "browser"]],
      ["responsive-devices", "devices", ["responsive", "mobile", "laptop"]],
      ["code-window", "code", ["development", "code", "web"]],
      ["ecommerce-cart", "cart", ["ecommerce", "sales", "website"]],
      ["landing-page", "landing", ["landing-page", "conversion", "design"]],
      ["mobile-interface", "phone", ["mobile", "interface", "app"]],
      ["global-network", "globe", ["internet", "global", "connection"]],
      ["cursor-click", "cursor", ["interaction", "click", "ux"]],
      ["component-system", "components", ["components", "design-system", "web"]],
      ["web-performance", "gauge", ["performance", "speed", "website"]],
      ["seo-search", "search", ["seo", "search", "growth"]],
      ["domain-launch", "rocket", ["launch", "domain", "website"]],
      ["wireframe-grid", "wireframe", ["wireframe", "ux", "planning"]],
      ["form-conversion", "form", ["form", "conversion", "leads"]],
      ["web-security", "lock", ["security", "privacy", "website"]],
      ["content-stack", "layers", ["content", "cms", "pages"]],
      ["hosting-cloud", "server", ["hosting", "cloud", "deployment"]],
      ["navigation-map", "sitemap", ["navigation", "architecture", "website"]],
      ["pixel-canvas", "pixels", ["design", "creative", "digital"]],
      ["web-analytics", "webstats", ["analytics", "metrics", "website"]],
    ],
  },
  {
    category: "artificial-intelligence",
    file: "ai",
    accent: "#c18cff",
    secondary: "#f4a62f",
    concepts: [
      ["neural-brain", "brain", ["ai", "neural", "intelligence"]],
      ["ai-chip", "chip", ["ai", "processor", "technology"]],
      ["assistant-bot", "bot", ["assistant", "chatbot", "ai"]],
      ["vision-eye", "eye", ["vision", "recognition", "ai"]],
      ["prompt-window", "prompt", ["prompt", "generative-ai", "interface"]],
      ["model-layers", "modelstack", ["model", "layers", "machine-learning"]],
      ["data-cube", "cube", ["data", "model", "training"]],
      ["spark-intelligence", "spark", ["innovation", "generative-ai", "future"]],
      ["language-network", "language", ["language", "nlp", "communication"]],
      ["learning-loop", "loop", ["learning", "training", "iteration"]],
      ["ai-hand", "hand", ["human-ai", "collaboration", "future"]],
      ["knowledge-tree", "knowledge", ["knowledge", "reasoning", "ai"]],
      ["prediction-orbit", "orbit", ["prediction", "model", "analytics"]],
      ["model-weights", "sliders", ["parameters", "model", "control"]],
      ["agent-workflow", "agents", ["agents", "workflow", "automation"]],
      ["semantic-search", "semantic", ["semantic", "search", "knowledge"]],
      ["multimodal-grid", "multimodal", ["multimodal", "image", "audio"]],
      ["safe-ai", "aiguard", ["responsible-ai", "security", "governance"]],
      ["ai-lab", "lab", ["research", "experiment", "innovation"]],
      ["future-core", "core", ["future", "technology", "intelligence"]],
    ],
  },
  {
    category: "analytics",
    file: "analytics",
    accent: "#f4a62f",
    secondary: "#8f5ae8",
    concepts: [
      ["growth-bars", "bars", ["growth", "metrics", "performance"]],
      ["trend-line", "line", ["trend", "forecast", "analytics"]],
      ["market-pie", "pie", ["distribution", "market", "data"]],
      ["performance-gauge", "speedometer", ["kpi", "performance", "dashboard"]],
      ["sales-funnel", "funnel", ["sales", "conversion", "funnel"]],
      ["data-table", "table", ["data", "report", "table"]],
      ["scatter-insights", "scatter", ["correlation", "insight", "data"]],
      ["heatmap-grid", "heatmap", ["heatmap", "behavior", "analytics"]],
      ["executive-dashboard", "dashboard", ["dashboard", "kpi", "business"]],
      ["goal-target", "target", ["goals", "performance", "strategy"]],
      ["geo-metrics", "map", ["location", "market", "data"]],
      ["cohort-rings", "rings", ["cohort", "segments", "retention"]],
      ["retention-curve", "curve", ["retention", "customers", "trend"]],
      ["comparison-columns", "columns", ["comparison", "metrics", "report"]],
      ["live-pulse", "pulse", ["realtime", "monitoring", "data"]],
      ["data-filter", "filter", ["filter", "segments", "analysis"]],
      ["insight-lens", "lens", ["insight", "research", "analysis"]],
      ["forecast-cloud", "forecast", ["forecast", "prediction", "planning"]],
      ["metric-cards", "scorecards", ["metrics", "dashboard", "kpi"]],
      ["data-story", "story", ["storytelling", "report", "insights"]],
    ],
  },
  {
    category: "business",
    file: "business",
    accent: "#e29a31",
    secondary: "#a76cf6",
    concepts: [
      ["city-growth", "buildings", ["business", "growth", "company"]],
      ["team-circle", "people", ["team", "culture", "collaboration"]],
      ["strategy-chess", "chess", ["strategy", "planning", "leadership"]],
      ["sales-target", "bullseye", ["sales", "goals", "growth"]],
      ["business-roadmap", "roadmap", ["roadmap", "strategy", "future"]],
      ["idea-light", "bulb", ["idea", "innovation", "business"]],
      ["market-megaphone", "megaphone", ["marketing", "communication", "growth"]],
      ["value-briefcase", "briefcase", ["business", "value", "professional"]],
      ["partnership-link", "handshake", ["partnership", "connection", "trust"]],
      ["startup-rocket", "startuplaunch", ["startup", "launch", "growth"]],
      ["revenue-coins", "coins", ["revenue", "finance", "sales"]],
      ["storefront-brand", "storefront", ["brand", "retail", "customers"]],
      ["factory-scale", "industrial", ["industry", "scale", "operations"]],
      ["leadership-flag", "flag", ["leadership", "vision", "team"]],
      ["customer-heart", "heart", ["customer", "loyalty", "experience"]],
      ["global-business", "worldtrade", ["global", "market", "expansion"]],
      ["organization-chart", "orgchart", ["organization", "team", "structure"]],
      ["negotiation-balance", "balance", ["negotiation", "decision", "value"]],
      ["business-shield", "riskguard", ["risk", "security", "business"]],
      ["next-horizon", "horizon", ["future", "vision", "innovation"]],
    ],
  },
];

const placements = ["right", "left", "top-right", "bottom-left", "center", "bottom-right", "top-left"];
const scales = ["compact", "standard", "large"];
const orientations = ["vertical", "square", "horizontal"];

function frame(content, accent, secondary, seed) {
  const decoration = [
    `<circle cx="400" cy="400" r="330" fill="none" stroke="${accent}" stroke-opacity=".18" stroke-width="2"/><circle cx="400" cy="400" r="275" fill="none" stroke="${secondary}" stroke-opacity=".15" stroke-dasharray="12 22"/>`,
    `<path d="M45 650Q220 420 385 540T755 190" fill="none" stroke="${secondary}" stroke-opacity=".2" stroke-width="3"/><path d="M70 705Q250 460 420 585T735 250" fill="none" stroke="${accent}" stroke-opacity=".16" stroke-width="2"/>`,
    `<g fill="${accent}" opacity=".14">${Array.from({ length: 35 }, (_, i) => `<circle cx="${80 + (i % 7) * 105}" cy="${90 + Math.floor(i / 7) * 145}" r="${3 + (i % 3)}"/>`).join("")}</g>`,
    `<path d="M80 180L400 30l320 150v440L400 770 80 620z" fill="none" stroke="${accent}" stroke-opacity=".16"/><path d="M145 215L400 95l255 120v370L400 705 145 585z" fill="none" stroke="${secondary}" stroke-opacity=".13"/>`,
    `<g fill="none" stroke="${secondary}" stroke-opacity=".14">${Array.from({ length: 6 }, (_, i) => `<rect x="${80 + i * 42}" y="${90 + i * 42}" width="${640 - i * 84}" height="${620 - i * 84}" rx="${24 + i * 8}"/>`).join("")}</g>`,
    `<path d="M40 400h720M400 40v720M120 120l560 560M680 120L120 680" stroke="${accent}" stroke-opacity=".1" stroke-dasharray="9 18"/>`,
  ][seed % 6];
  const angle = ((seed * 17) % 25) - 12;
  const shiftX = ((seed * 37) % 90) - 45;
  const shiftY = ((seed * 53) % 80) - 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${accent}"/><stop offset="1" stop-color="${secondary}"/></linearGradient><radialGradient id="r"><stop stop-color="${secondary}" stop-opacity=".28"/><stop offset="1" stop-color="#08070d" stop-opacity="0"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><circle cx="400" cy="400" r="360" fill="url(#r)"/>${decoration}<g transform="translate(${shiftX} ${shiftY}) rotate(${angle} 400 400)">${content}</g></svg>`;
}

function draw(type, accent, secondary, seed) {
  const a = accent;
  const b = secondary;
  const g = "url(#g)";
  const node = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${a}" filter="url(#glow)"/>`;
  const card = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#100b19" stroke="${g}" stroke-width="4"/>`;
  const variants = {
    network: `<g fill="none" stroke="${g}" stroke-width="7"><path d="M170 235L385 160l240 145-85 270-275 55-135-210z"/><path d="M170 235l370 340M625 305L265 630M385 160L130 420"/></g>${node(170,235,20)}${node(385,160,16)}${node(625,305,22)}${node(540,575,18)}${node(265,630,20)}${node(130,420,16)}`,
    robot: `<path d="M190 610h420M280 610l35-140 95-55 70-130 70 38-63 159-100 72-20 56" fill="none" stroke="${g}" stroke-width="22" stroke-linecap="round"/><circle cx="515" cy="300" r="52" fill="#100b19" stroke="${a}" stroke-width="8"/><path d="M520 245l75-75M575 150h80v80" fill="none" stroke="${b}" stroke-width="15"/>`,
    gears: `<g fill="none" stroke="${g}"><circle cx="315" cy="385" r="150" stroke-width="34" stroke-dasharray="54 25"/><circle cx="535" cy="555" r="92" stroke-width="25" stroke-dasharray="35 18"/><circle cx="315" cy="385" r="45" stroke="${a}" stroke-width="18"/><circle cx="535" cy="555" r="28" stroke="${b}" stroke-width="13"/></g>`,
    pipeline: `${card(90,190,165,110)}${card(318,345,165,110)}${card(545,500,165,110)}<path d="M255 245h90v155M483 400h90v155" fill="none" stroke="${g}" stroke-width="14"/><path d="M320 380l25 20-25 20M548 535l25 20-25 20" fill="none" stroke="${a}" stroke-width="10"/>`,
    chat: `<path d="M120 205h420a35 35 0 0135 35v210a35 35 0 01-35 35H290l-105 85 20-85h-85a35 35 0 01-35-35V240a35 35 0 0135-35z" fill="#100b19" stroke="${g}" stroke-width="6"/><g fill="${a}"><circle cx="220" cy="345" r="18"/><circle cx="330" cy="345" r="18"/><circle cx="440" cy="345" r="18"/></g><path d="M455 555h180a30 30 0 0130 30v75l-60-45H455z" fill="${b}" opacity=".55"/>`,
    calendar: `${card(135,145,530,515)}<path d="M135 270h530M260 110v90M540 110v90" stroke="${g}" stroke-width="18" stroke-linecap="round"/><g fill="${a}">${Array.from({length:12},(_,i)=>`<rect x="${190+(i%4)*115}" y="${325+Math.floor(i/4)*95}" width="48" height="42" rx="9" opacity="${.45+(i%3)*.2}"/>`).join("")}</g><path d="M455 535l38 38 82-100" fill="none" stroke="${b}" stroke-width="18"/>`,
    cloud: `<path d="M205 585c-125 0-145-175-28-215-15-140 175-205 255-95 105-50 205 50 170 150 110 35 75 160-25 160z" fill="#100b19" stroke="${g}" stroke-width="8"/><path d="M300 430l100-85 100 85M400 350v190" fill="none" stroke="${a}" stroke-width="18"/><path d="M330 520l70 60 70-60" fill="none" stroke="${b}" stroke-width="16"/>`,
    shield: `<path d="M400 105l235 92v185c0 155-94 265-235 325-141-60-235-170-235-325V197z" fill="#100b19" stroke="${g}" stroke-width="8"/><path d="M285 395l80 80 165-190" fill="none" stroke="${a}" stroke-width="28" stroke-linecap="round"/>`,
    cards: `${card(95,135,265,205)}${card(440,135,265,205)}${card(95,430,265,205)}${card(440,430,265,205)}<g stroke="${g}" stroke-width="14" stroke-linecap="round"><path d="M145 210h150M490 210h150M145 505h150M490 505h150"/></g><g fill="${a}"><circle cx="150" cy="280" r="16"/><circle cx="495" cy="280" r="16"/><circle cx="150" cy="575" r="16"/><circle cx="495" cy="575" r="16"/></g>`,
    bolt: `<path d="M460 75L175 455h205l-42 285 287-410H420z" fill="${g}" stroke="${a}" stroke-width="8"/><circle cx="400" cy="405" r="315" fill="none" stroke="${b}" stroke-opacity=".35" stroke-width="4" stroke-dasharray="16 24"/>`,
    factory: `<path d="M95 650V355l170-95v95l175-95v95l170-95v390z" fill="#100b19" stroke="${g}" stroke-width="7"/><path d="M570 270V115h80v535" fill="none" stroke="${a}" stroke-width="18"/><g fill="${b}">${Array.from({length:8},(_,i)=>`<rect x="${155+(i%4)*115}" y="${445+Math.floor(i/4)*95}" width="58" height="52" rx="7"/>`).join("")}</g>`,
    api: `${card(92,275,190,190)}${card(518,275,190,190)}<circle cx="400" cy="370" r="105" fill="#100b19" stroke="${g}" stroke-width="7"/><text x="400" y="392" text-anchor="middle" fill="${a}" font-family="Arial" font-size="58" font-weight="800">API</text><path d="M282 370h13M505 370h13" stroke="${b}" stroke-width="20" stroke-linecap="round"/>`,
    tree: `<path d="M400 145v145M400 290H190v120M400 290h210v120M190 410v120M190 410h135v120M610 410v120M610 410H485v120" fill="none" stroke="${g}" stroke-width="12"/><g fill="#100b19" stroke="${a}" stroke-width="6"><rect x="310" y="80" width="180" height="90" rx="20"/><rect x="100" y="510" width="180" height="100" rx="20"/><rect x="275" y="510" width="180" height="100" rx="20"/><rect x="520" y="510" width="180" height="100" rx="20"/></g>`,
    mail: `<rect x="100" y="190" width="470" height="330" rx="30" fill="#100b19" stroke="${g}" stroke-width="7"/><path d="M115 225l220 180 220-180" fill="none" stroke="${a}" stroke-width="13"/><path d="M475 585h205M620 530l60 55-60 55" fill="none" stroke="${b}" stroke-width="16"/><g fill="${a}">${[0,1,2].map(i=>`<circle cx="${190+i*95}" cy="620" r="${12+i*3}" opacity="${.45+i*.2}"/>`).join("")}</g>`,
    documents: `<g fill="#100b19" stroke="${g}" stroke-width="6"><path d="M150 150h310l95 95v405H150z"/><path d="M460 150v100h95"/></g><path d="M220 335h265M220 420h265M220 505h175" stroke="${a}" stroke-width="18" stroke-linecap="round"/><circle cx="585" cy="570" r="105" fill="${b}" opacity=".75"/><path d="M535 570l32 32 65-75" fill="none" stroke="#fff" stroke-width="15"/>`,
    hub: `<circle cx="400" cy="400" r="125" fill="#100b19" stroke="${g}" stroke-width="8"/><circle cx="400" cy="400" r="42" fill="${a}"/><g fill="#100b19" stroke="${b}" stroke-width="7">${[[130,145],[590,145],[105,555],[615,555],[400,690]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="62"/>`).join("")}</g><path d="M165 190l150 135M555 190L485 315M160 530l155-55M555 535l-70-60M400 648V525" stroke="${g}" stroke-width="10"/>`,
    timer: `<circle cx="400" cy="420" r="250" fill="#100b19" stroke="${g}" stroke-width="12"/><path d="M335 105h130M400 170V95M400 420l120-100" stroke="${a}" stroke-width="24" stroke-linecap="round"/><path d="M185 245l-55-55M615 245l55-55" stroke="${b}" stroke-width="18"/><circle cx="400" cy="420" r="28" fill="${b}"/>`,
    arrows: `<path d="M90 265h500l-80-80M590 265l-80 80M710 535H210l80-80M210 535l80 80" fill="none" stroke="${g}" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/><circle cx="400" cy="400" r="78" fill="#100b19" stroke="${a}" stroke-width="8"/>`,
    checklist: `${card(145,100,510,590)}<g fill="none" stroke-width="14" stroke-linecap="round"><path d="M215 250l25 25 50-60M215 390l25 25 50-60M215 530l25 25 50-60" stroke="${a}"/><path d="M340 245h210M340 385h210M340 525h150" stroke="${b}"/></g>`,
    blocks: `<g fill="#100b19" stroke="${g}" stroke-width="6"><rect x="100" y="120" width="245" height="210" rx="30"/><rect x="455" y="120" width="245" height="210" rx="30"/><rect x="100" y="470" width="245" height="210" rx="30"/><rect x="455" y="470" width="245" height="210" rx="30"/></g><path d="M345 225h110M225 330v140M575 330v140M345 575h110" stroke="${a}" stroke-width="22"/><circle cx="400" cy="400" r="55" fill="${b}"/>`,
    browser: `${card(90,120,620,535)}<path d="M90 225h620" stroke="${g}" stroke-width="7"/><g fill="${a}"><circle cx="145" cy="175" r="14"/><circle cx="190" cy="175" r="14"/><circle cx="235" cy="175" r="14"/></g><rect x="145" y="280" width="225" height="280" rx="20" fill="${b}" opacity=".35"/><path d="M420 305h220M420 390h180M420 475h210" stroke="${a}" stroke-width="18" stroke-linecap="round"/>`,
    devices: `<rect x="80" y="170" width="480" height="330" rx="24" fill="#100b19" stroke="${g}" stroke-width="8"/><path d="M45 545h555l-45 65H95z" fill="${b}" opacity=".65"/><rect x="515" y="265" width="190" height="360" rx="35" fill="#100b19" stroke="${a}" stroke-width="8"/><circle cx="610" cy="575" r="12" fill="${a}"/>`,
    code: `${card(110,125,580,550)}<path d="M110 225h580" stroke="${g}" stroke-width="7"/><path d="M280 330l-85 75 85 75M520 330l85 75-85 75M455 285L350 535" fill="none" stroke="${a}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`,
    cart: `<path d="M115 165h70l75 325h320l95-235H220" fill="none" stroke="${g}" stroke-width="20" stroke-linejoin="round"/><circle cx="320" cy="590" r="42" fill="${a}"/><circle cx="555" cy="590" r="42" fill="${b}"/><path d="M365 330h135M432 265v135" stroke="#f5efe5" stroke-width="18"/>`,
    landing: `${card(115,105,570,590)}<rect x="165" y="165" width="470" height="185" rx="25" fill="${b}" opacity=".28"/><path d="M205 405h390M205 480h275" stroke="${a}" stroke-width="20" stroke-linecap="round"/><rect x="205" y="545" width="190" height="65" rx="32" fill="${g}"/>`,
    phone: `<rect x="220" y="70" width="360" height="660" rx="55" fill="#100b19" stroke="${g}" stroke-width="9"/><rect x="265" y="165" width="270" height="160" rx="22" fill="${b}" opacity=".3"/><path d="M285 390h230M285 470h180M285 550h230" stroke="${a}" stroke-width="18" stroke-linecap="round"/><circle cx="400" cy="675" r="18" fill="${b}"/>`,
    globe: `<circle cx="400" cy="400" r="290" fill="#100b19" stroke="${g}" stroke-width="8"/><ellipse cx="400" cy="400" rx="125" ry="290" fill="none" stroke="${a}" stroke-width="7"/><path d="M110 400h580M150 275h500M150 525h500" stroke="${b}" stroke-width="6"/><path d="M400 110v580" stroke="${a}" stroke-width="5"/>`,
    cursor: `<path d="M195 95l390 350-185 35 105 190-95 50-105-195-130 135z" fill="#100b19" stroke="${g}" stroke-width="10"/><circle cx="585" cy="250" r="80" fill="none" stroke="${a}" stroke-width="9" stroke-dasharray="16 14"/><circle cx="585" cy="250" r="130" fill="none" stroke="${b}" stroke-opacity=".45" stroke-width="5"/>`,
    gauge: `<path d="M130 540a285 285 0 01540 0" fill="none" stroke="${g}" stroke-width="55" stroke-dasharray="120 28"/><path d="M400 530l155-175" stroke="${a}" stroke-width="24" stroke-linecap="round"/><circle cx="400" cy="530" r="45" fill="${b}"/><path d="M210 620h380" stroke="${a}" stroke-width="12"/>`,
    search: `<circle cx="335" cy="335" r="210" fill="#100b19" stroke="${g}" stroke-width="12"/><path d="M490 490l180 180" stroke="${a}" stroke-width="35" stroke-linecap="round"/><path d="M215 335h240M335 215v240" stroke="${b}" stroke-width="10" stroke-opacity=".5"/>`,
    rocket: `<path d="M390 620c-75-135-90-330 35-475 125 145 110 340 35 475z" fill="#100b19" stroke="${g}" stroke-width="9"/><circle cx="425" cy="325" r="58" fill="${b}" opacity=".65"/><path d="M355 515l-115 90 25-155 95-65M465 515l115 90-25-155-95-65M390 620l35 105 35-105" fill="${a}" opacity=".8"/>`,
    wireframe: `<g fill="none" stroke="${g}" stroke-width="6"><rect x="90" y="105" width="620" height="590" rx="25"/><rect x="135" y="165" width="530" height="130" rx="16"/><rect x="135" y="340" width="245" height="300" rx="16"/><rect x="420" y="340" width="245" height="130" rx="16"/><rect x="420" y="510" width="245" height="130" rx="16"/></g><path d="M175 210h220M175 390h155M460 390h160" stroke="${a}" stroke-width="15"/>`,
    form: `${card(165,85,470,630)}<path d="M230 210h340M230 320h340M230 430h340" stroke="${b}" stroke-width="13" stroke-linecap="round"/><rect x="230" y="520" width="230" height="80" rx="40" fill="${g}"/><path d="M505 545l28 28 55-65" fill="none" stroke="${a}" stroke-width="14"/>`,
    lock: `<rect x="165" y="330" width="470" height="340" rx="40" fill="#100b19" stroke="${g}" stroke-width="9"/><path d="M255 330V235a145 145 0 01290 0v95" fill="none" stroke="${a}" stroke-width="30"/><circle cx="400" cy="475" r="45" fill="${b}"/><path d="M400 515v75" stroke="${b}" stroke-width="20"/>`,
    layers: `<path d="M400 90L705 260 400 430 95 260z" fill="#100b19" stroke="${g}" stroke-width="8"/><path d="M105 390l295 165 295-165M105 515l295 165 295-165" fill="none" stroke="${a}" stroke-width="18" stroke-linejoin="round"/>`,
    sitemap: `<path d="M400 150v160M150 310h500M150 310v220M400 310v220M650 310v220" stroke="${g}" stroke-width="14"/><g fill="#100b19" stroke="${a}" stroke-width="7"><rect x="300" y="70" width="200" height="110" rx="24"/><rect x="55" y="520" width="190" height="120" rx="24"/><rect x="305" y="520" width="190" height="120" rx="24"/><rect x="555" y="520" width="190" height="120" rx="24"/></g>`,
    pixels: `<g>${Array.from({length:49},(_,i)=>{const x=95+(i%7)*88,y=95+Math.floor(i/7)*88,active=(i*seed+3*i)%5<2;return `<rect x="${x}" y="${y}" width="62" height="62" rx="${(i+seed)%3===0?31:9}" fill="${active?g:"#100b19"}" stroke="${active?"none":b}" opacity="${.4+(i%4)*.15}"/>`}).join("")}</g>`,
    dashboard: `${card(75,105,650,590)}<path d="M75 220h650M275 220v475" stroke="${g}" stroke-width="6"/><path d="M330 530l85-95 75 35 115-170" fill="none" stroke="${a}" stroke-width="15"/><g fill="${b}">${[0,1,2,3].map(i=>`<rect x="${330+i*80}" y="${590-i*45}" width="45" height="${55+i*45}" rx="8"/>`).join("")}</g><circle cx="175" cy="335" r="62" fill="none" stroke="${a}" stroke-width="18" stroke-dasharray="260 130"/>`,
    brain: `<path d="M390 145c-80-105-245-10-200 105-120 35-105 210 10 225-25 125 130 190 200 85 75 105 235 35 200-95 115-35 100-205-15-225 35-120-125-205-195-95z" fill="#100b19" stroke="${g}" stroke-width="8"/><g fill="${a}">${[[255,270],[390,220],[515,310],[305,430],[470,505]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="15"/>`).join("")}</g><path d="M255 270l135-50 125 90-210 120 165 75" fill="none" stroke="${b}" stroke-width="8"/>`,
    chip: `<rect x="185" y="185" width="430" height="430" rx="55" fill="#100b19" stroke="${g}" stroke-width="10"/><rect x="295" y="295" width="210" height="210" rx="30" fill="${b}" opacity=".35" stroke="${a}" stroke-width="7"/><g stroke="${a}" stroke-width="16">${[240,320,400,480,560].map(v=>`<path d="M${v} 100v85M${v} 615v85M100 ${v}h85M615 ${v}h85"/>`).join("")}</g>`,
    bot: `<rect x="150" y="210" width="500" height="390" rx="95" fill="#100b19" stroke="${g}" stroke-width="9"/><path d="M400 210V120M350 120h100" stroke="${a}" stroke-width="15"/><circle cx="295" cy="365" r="42" fill="${a}"/><circle cx="505" cy="365" r="42" fill="${b}"/><path d="M275 500q125 85 250 0" fill="none" stroke="${g}" stroke-width="18"/>`,
    eye: `<path d="M70 400q330-300 660 0-330 300-660 0z" fill="#100b19" stroke="${g}" stroke-width="9"/><circle cx="400" cy="400" r="145" fill="${b}" opacity=".45"/><circle cx="400" cy="400" r="75" fill="${a}"/><circle cx="430" cy="365" r="24" fill="#fff"/>`,
    prompt: `${card(95,125,610,550)}<path d="M95 230h610" stroke="${g}" stroke-width="7"/><path d="M170 340l65 55-65 55M285 465h245" fill="none" stroke="${a}" stroke-width="18" stroke-linecap="round"/><circle cx="155" cy="180" r="13" fill="${a}"/><circle cx="195" cy="180" r="13" fill="${b}"/>`,
    cube: `<path d="M400 75l280 160v330L400 725 120 565V235z" fill="#100b19" stroke="${g}" stroke-width="8"/><path d="M120 235l280 165 280-165M400 400v325" fill="none" stroke="${a}" stroke-width="9"/><path d="M250 315l150-90 150 90-150 90z" fill="${b}" opacity=".4"/>`,
    spark: `<path d="M400 55l65 245 245 65-245 65-65 245-65-245-245-65 245-65z" fill="${g}"/><path d="M625 90l22 85 85 22-85 22-22 85-22-85-85-22 85-22zM170 515l30 110 110 30-110 30-30 110-30-110-110-30 110-30z" fill="${a}" opacity=".75"/>`,
    loop: `<path d="M610 315a235 235 0 00-395-60M190 255l20-120 120 35M190 485a235 235 0 00395 60M610 545l-20 120-120-35" fill="none" stroke="${g}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/><circle cx="400" cy="400" r="90" fill="#100b19" stroke="${a}" stroke-width="8"/>`,
    hand: `<path d="M150 625c110-35 115-130 210-135l-5-255c0-45 65-45 68 0l8 145 25-235c5-45 70-35 65 10l-10 230 35-190c8-43 70-28 60 16l-35 210 40-115c15-40 75-15 58 25l-72 190c-40 105-120 155-245 155z" fill="#100b19" stroke="${g}" stroke-width="8"/><circle cx="500" cy="275" r="95" fill="${b}" opacity=".35"/>`,
    orbit: `<g fill="none" stroke="${g}" stroke-width="7"><ellipse cx="400" cy="400" rx="310" ry="135" transform="rotate(25 400 400)"/><ellipse cx="400" cy="400" rx="310" ry="135" transform="rotate(-35 400 400)"/><ellipse cx="400" cy="400" rx="135" ry="310"/></g><circle cx="400" cy="400" r="72" fill="${a}" filter="url(#glow)"/>${node(660,290,22)}${node(185,550,18)}${node(430,105,16)}`,
    sliders: `<g stroke="${g}" stroke-width="16" stroke-linecap="round"><path d="M145 220h510M145 400h510M145 580h510"/></g><g fill="#100b19" stroke="${a}" stroke-width="10"><circle cx="290" cy="220" r="48"/><circle cx="530" cy="400" r="48"/><circle cx="370" cy="580" r="48"/></g>`,
    agents: `<circle cx="400" cy="400" r="115" fill="#100b19" stroke="${g}" stroke-width="8"/><g fill="#100b19" stroke="${a}" stroke-width="7"><circle cx="175" cy="180" r="85"/><circle cx="625" cy="180" r="85"/><circle cx="175" cy="620" r="85"/><circle cx="625" cy="620" r="85"/></g><path d="M240 240l85 85M560 240l-85 85M240 560l85-85M560 560l-85-85" stroke="${b}" stroke-width="14"/>`,
    multimodal: `<g fill="#100b19" stroke="${g}" stroke-width="6"><rect x="85" y="125" width="280" height="240" rx="30"/><rect x="435" y="125" width="280" height="240" rx="30"/><rect x="85" y="435" width="280" height="240" rx="30"/><rect x="435" y="435" width="280" height="240" rx="30"/></g><path d="M140 305l70-75 55 50 55-95M500 250h150M575 185v130M145 555q80-90 160 0M490 545h170" fill="none" stroke="${a}" stroke-width="14"/>`,
    lab: `<path d="M290 85h220M335 85v205L155 625a55 55 0 0050 80h390a55 55 0 0050-80L465 290V85" fill="#100b19" stroke="${g}" stroke-width="9"/><path d="M250 535h300" stroke="${a}" stroke-width="12"/><g fill="${b}"><circle cx="335" cy="575" r="25"/><circle cx="450" cy="625" r="18"/><circle cx="505" cy="540" r="14"/></g>`,
    core: `<circle cx="400" cy="400" r="210" fill="#100b19" stroke="${g}" stroke-width="14" stroke-dasharray="35 18"/><circle cx="400" cy="400" r="120" fill="${b}" opacity=".35"/><circle cx="400" cy="400" r="58" fill="${a}" filter="url(#glow)"/><path d="M400 80v105M400 615v105M80 400h105M615 400h105" stroke="${a}" stroke-width="20"/>`,
    bars: `<path d="M100 660V150M100 660h600" stroke="${b}" stroke-width="7"/><g>${[0,1,2,3,4].map(i=>`<rect x="${160+i*105}" y="${555-i*82+(i%2)*45}" width="65" height="${105+i*82-(i%2)*45}" rx="12" fill="${i%2?b:g}" opacity="${.65+i*.07}"/>`).join("")}</g><path d="M150 480l135-95 105 35 125-150 120-80" fill="none" stroke="#f5efe5" stroke-width="12"/>`,
    line: `<path d="M95 650V125M95 650h620" stroke="${b}" stroke-width="7"/><path d="M125 555l105-105 95 35 105-190 110 60 145-205" fill="none" stroke="${g}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/><g fill="${a}">${[[125,555],[230,450],[325,485],[430,295],[540,355],[685,150]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="17"/>`).join("")}</g>`,
    pie: `<circle cx="350" cy="390" r="265" fill="#100b19" stroke="${g}" stroke-width="7"/><path d="M350 390V125a265 265 0 01245 365z" fill="${a}" opacity=".75"/><path d="M350 390l245 100a265 265 0 01-370 135z" fill="${b}" opacity=".65"/><circle cx="350" cy="390" r="110" fill="#0c0911"/><path d="M645 220h95M645 285h70M645 520h95M645 585h70" stroke="${g}" stroke-width="12"/>`,
    funnel: `<path d="M90 135h620L510 390v225l-220 95V390z" fill="#100b19" stroke="${g}" stroke-width="9"/><path d="M140 225h520M205 330h390M300 445h200" stroke="${a}" stroke-width="20"/><circle cx="400" cy="625" r="32" fill="${b}"/>`,
    table: `${card(85,105,630,590)}<path d="M85 220h630M85 340h630M85 460h630M85 580h630M275 220v475M495 220v475" stroke="${g}" stroke-width="6"/><g fill="${a}">${Array.from({length:9},(_,i)=>`<rect x="${120+(i%3)*210}" y="${265+Math.floor(i/3)*120}" width="${80+(i%2)*55}" height="16" rx="8" opacity="${.5+(i%3)*.2}"/>`).join("")}</g>`,
    scatter: `<path d="M110 650V120M110 650h590" stroke="${b}" stroke-width="7"/><g fill="${a}">${Array.from({length:24},(_,i)=>`<circle cx="${155+((i*83+seed*11)%500)}" cy="${170+((i*137+seed*7)%420)}" r="${8+(i%5)*3}" opacity="${.45+(i%4)*.14}"/>`).join("")}</g><path d="M145 575L665 190" stroke="${g}" stroke-width="9" stroke-dasharray="18 14"/>`,
    heatmap: `<g>${Array.from({length:49},(_,i)=>{const level=((i*7+seed*13)%10)/10;return `<rect x="${95+(i%7)*88}" y="${95+Math.floor(i/7)*88}" width="72" height="72" rx="10" fill="${level>.5?a:b}" opacity="${.18+level*.75}"/>`}).join("")}</g>`,
    target: `<circle cx="400" cy="400" r="300" fill="#100b19" stroke="${g}" stroke-width="8"/><circle cx="400" cy="400" r="205" fill="none" stroke="${b}" stroke-width="30"/><circle cx="400" cy="400" r="105" fill="${a}" opacity=".55"/><circle cx="400" cy="400" r="35" fill="#fff"/><path d="M625 175L430 370M625 175h-105M625 175v105" stroke="${a}" stroke-width="18"/>`,
    map: `<path d="M105 200l190-85 210 90 190-85v480l-190 85-210-90-190 85z" fill="#100b19" stroke="${g}" stroke-width="8"/><path d="M295 115v480M505 205v480" stroke="${b}" stroke-width="7"/><path d="M400 255c-75 0-105 85-65 145l65 105 65-105c40-60 10-145-65-145z" fill="${a}"/><circle cx="400" cy="340" r="30" fill="#fff"/>`,
    rings: `<g fill="none" stroke-width="48"><circle cx="400" cy="400" r="285" stroke="${a}" stroke-dasharray="620 1170"/><circle cx="400" cy="400" r="205" stroke="${b}" stroke-dasharray="500 790"/><circle cx="400" cy="400" r="125" stroke="${g}" stroke-dasharray="320 470"/></g><circle cx="400" cy="400" r="55" fill="#100b19"/>`,
    curve: `<path d="M95 650V120M95 650h620" stroke="${b}" stroke-width="7"/><path d="M130 180c120 35 105 200 210 240s190-10 335 190" fill="none" stroke="${g}" stroke-width="22"/><path d="M130 235c140 50 130 175 245 200s170 20 300 115" fill="none" stroke="${a}" stroke-opacity=".45" stroke-width="12" stroke-dasharray="18 15"/>`,
    columns: `<g>${[0,1,2,3].map(i=>`<rect x="${100+i*175}" y="${180+i%2*80}" width="62" height="${470-i%2*80}" rx="12" fill="${a}" opacity=".65"/><rect x="${170+i*175}" y="${290-i%2*70}" width="62" height="${360+i%2*70}" rx="12" fill="${b}" opacity=".7"/>`).join("")}</g><path d="M75 650h650" stroke="${g}" stroke-width="9"/>`,
    pulse: `<path d="M55 420h145l55-170 95 350 90-465 85 285h220" fill="none" stroke="${g}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><circle cx="440" cy="135" r="26" fill="${a}"/><circle cx="350" cy="600" r="26" fill="${b}"/><path d="M95 680h610" stroke="${b}" stroke-opacity=".35" stroke-width="7"/>`,
    filter: `<path d="M95 125h610L485 390v230l-170 80V390z" fill="#100b19" stroke="${g}" stroke-width="9"/><path d="M170 230h460M240 330h320" stroke="${a}" stroke-width="18"/><circle cx="400" cy="510" r="34" fill="${b}"/>`,
    lens: `<circle cx="330" cy="330" r="225" fill="#100b19" stroke="${g}" stroke-width="12"/><path d="M495 495l190 190" stroke="${a}" stroke-width="38" stroke-linecap="round"/><path d="M200 395l90-90 75 45 105-130" fill="none" stroke="${b}" stroke-width="15"/><circle cx="290" cy="305" r="15" fill="${a}"/>`,
    forecast: `<path d="M150 585c-105 0-120-145-25-180-5-115 145-170 210-85 90-45 180 40 155 125 90 25 65 140-25 140z" fill="#100b19" stroke="${g}" stroke-width="8"/><path d="M410 650l90-105 70 45 110-160" fill="none" stroke="${a}" stroke-width="18"/><path d="M620 430h60v60" fill="none" stroke="${b}" stroke-width="15"/>`,
    story: `<path d="M115 615V145M115 615h570" stroke="${b}" stroke-width="7"/><path d="M150 535l105-160 100 60 110-220 115 105 90-175" fill="none" stroke="${g}" stroke-width="20"/><g fill="#100b19" stroke="${a}" stroke-width="7">${[[255,375],[355,435],[465,215],[580,320]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="38"/>`).join("")}</g>`,
    buildings: `<path d="M90 670V350l170-80v400M285 670V125l220 125v420M535 670V365l175-75v380" fill="#100b19" stroke="${g}" stroke-width="8"/><g fill="${a}">${Array.from({length:20},(_,i)=>`<rect x="${330+(i%4)*42}" y="${295+Math.floor(i/4)*62}" width="20" height="28" rx="4" opacity="${.5+(i%3)*.2}"/>`).join("")}</g>`,
    people: `<g fill="#100b19" stroke="${g}" stroke-width="8"><circle cx="400" cy="225" r="90"/><circle cx="185" cy="330" r="70"/><circle cx="615" cy="330" r="70"/><path d="M245 690v-95c0-120 70-205 155-205s155 85 155 205v95z"/><path d="M65 690v-75c0-95 55-160 120-160 45 0 85 30 105 80M735 690v-75c0-95-55-160-120-160-45 0-85 30-105 80"/></g><circle cx="400" cy="225" r="25" fill="${a}"/>`,
    chess: `<path d="M245 650h310l-35-105H280zM310 545l35-210-70-85 125-135 125 135-70 85 35 210" fill="#100b19" stroke="${g}" stroke-width="9"/><circle cx="400" cy="210" r="52" fill="${a}" opacity=".7"/><path d="M175 700h450" stroke="${b}" stroke-width="22"/>`,
    roadmap: `<path d="M120 665c10-140 185-105 185-245s195-95 195-230S665 95 690 115" fill="none" stroke="${g}" stroke-width="35" stroke-linecap="round" stroke-dasharray="50 24"/><g fill="${a}">${[[120,665],[305,420],[500,190],[690,115]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="38"/>`).join("")}<path d="M690 115l-100-25 55 95z"/></g>`,
    bulb: `<path d="M400 95c-155 0-245 165-165 300 40 68 95 88 105 175h120c10-87 65-107 105-175 80-135-10-300-165-300z" fill="#100b19" stroke="${g}" stroke-width="9"/><path d="M330 615h140M345 675h110" stroke="${a}" stroke-width="22" stroke-linecap="round"/><path d="M400 190v80M230 240l60 55M570 240l-60 55" stroke="${b}" stroke-width="15"/>`,
    megaphone: `<path d="M115 340h130l380-180v420L245 400H115z" fill="#100b19" stroke="${g}" stroke-width="9"/><path d="M245 405l65 260H185l-45-260" fill="${b}" opacity=".6"/><path d="M655 260l85-65M675 370h100M655 480l85 65" stroke="${a}" stroke-width="18"/>`,
    briefcase: `<rect x="105" y="245" width="590" height="400" rx="45" fill="#100b19" stroke="${g}" stroke-width="10"/><path d="M285 245v-80h230v80M105 390h590" fill="none" stroke="${a}" stroke-width="18"/><rect x="345" y="360" width="110" height="75" rx="14" fill="${b}"/>`,
    handshake: `<path d="M70 440l175-170 130 65 70-50 285 185-105 145-165-95-80 70-145-55-85 70z" fill="#100b19" stroke="${g}" stroke-width="9"/><path d="M290 340l95 80 80-60 165 120M235 535l75-75M315 570l70-70M395 590l60-60" fill="none" stroke="${a}" stroke-width="15"/>`,
    coins: `<g fill="#100b19" stroke="${g}" stroke-width="8"><ellipse cx="300" cy="575" rx="175" ry="75"/><path d="M125 575v-85c0 42 78 75 175 75s175-33 175-75v85"/><ellipse cx="505" cy="365" rx="175" ry="75"/><path d="M330 365v-95c0 42 78 75 175 75s175-33 175-75v95"/></g><text x="500" y="300" text-anchor="middle" fill="${a}" font-size="70" font-family="Arial" font-weight="800">$</text>`,
    storefront: `<path d="M105 285h590l-60-150H165zM135 285v390h530V285" fill="#100b19" stroke="${g}" stroke-width="9"/><path d="M110 285c0 60 95 60 95 0 0 60 95 60 95 0 0 60 100 60 100 0 0 60 100 60 100 0 0 60 95 60 95 0 0 60 95 60 95 0" fill="${b}" opacity=".5" stroke="${a}" stroke-width="7"/><rect x="230" y="455" width="340" height="220" fill="${a}" opacity=".18"/>`,
    flag: `<path d="M185 705V105M195 125h400l-80 125 80 125H195" fill="#100b19" stroke="${g}" stroke-width="10"/><path d="M250 225h220" stroke="${a}" stroke-width="20"/><circle cx="185" cy="705" r="38" fill="${b}"/>`,
    heart: `<path d="M400 690S95 505 95 285c0-165 210-220 305-75 95-145 305-90 305 75 0 220-305 405-305 405z" fill="#100b19" stroke="${g}" stroke-width="10"/><path d="M205 390h105l45-90 75 185 55-95h110" fill="none" stroke="${a}" stroke-width="18"/>`,
    orgchart: `<path d="M400 190v145M165 335h470M165 335v150M400 335v150M635 335v150" stroke="${g}" stroke-width="14"/><g fill="#100b19" stroke="${a}" stroke-width="7"><circle cx="400" cy="120" r="75"/><circle cx="165" cy="555" r="90"/><circle cx="400" cy="555" r="90"/><circle cx="635" cy="555" r="90"/></g>`,
    balance: `<path d="M400 115v500M220 675h360M135 255h530M400 180L160 255M400 180l240 75" stroke="${g}" stroke-width="15"/><path d="M70 255h180l-35 180H105zM550 255h180l-35 180H585z" fill="#100b19" stroke="${a}" stroke-width="8"/><circle cx="400" cy="115" r="35" fill="${b}"/>`,
    components: `<path d="M400 110l130 105-130 105-130-105z" fill="${b}" opacity=".55" stroke="${a}" stroke-width="7"/><g fill="#100b19" stroke="${g}" stroke-width="7"><rect x="70" y="390" width="200" height="150" rx="25"/><rect x="300" y="390" width="200" height="150" rx="25"/><rect x="530" y="390" width="200" height="150" rx="25"/></g><path d="M400 320v70M270 465h30M500 465h30" stroke="${a}" stroke-width="16"/><circle cx="400" cy="640" r="55" fill="${a}" opacity=".7"/>`,
    webstats: `${card(80,110,640,575)}<path d="M80 215h640" stroke="${g}" stroke-width="7"/><circle cx="235" cy="400" r="105" fill="none" stroke="${a}" stroke-width="32" stroke-dasharray="420 240"/><path d="M390 515l70-95 65 35 115-155" fill="none" stroke="${b}" stroke-width="16"/><path d="M390 585h250" stroke="${a}" stroke-width="12"/><g fill="${a}"><circle cx="135" cy="162" r="12"/><circle cx="175" cy="162" r="12"/></g>`,
    server: `<g fill="#100b19" stroke="${g}" stroke-width="7"><rect x="140" y="115" width="520" height="155" rx="25"/><rect x="140" y="325" width="520" height="155" rx="25"/><rect x="140" y="535" width="520" height="155" rx="25"/></g><g fill="${a}">${[0,1,2].map(i=>`<circle cx="205" cy="${192+i*210}" r="18"/><circle cx="265" cy="${192+i*210}" r="18"/>`).join("")}</g><path d="M340 192h250M340 402h250M340 612h250" stroke="${b}" stroke-width="15" stroke-linecap="round"/>`,
    modelstack: `<g fill="#100b19" stroke="${g}" stroke-width="7"><ellipse cx="400" cy="205" rx="255" ry="105"/><ellipse cx="400" cy="400" rx="210" ry="90"/><ellipse cx="400" cy="575" rx="160" ry="70"/></g><path d="M145 205v95c0 58 114 105 255 105s255-47 255-105v-95M190 400v90c0 50 94 90 210 90s210-40 210-90v-90" fill="none" stroke="${a}" stroke-width="10"/><g fill="${b}"><circle cx="400" cy="205" r="26"/><circle cx="400" cy="400" r="22"/><circle cx="400" cy="575" r="18"/></g>`,
    language: `<path d="M105 150h590v380H390l-145 120 25-120H105z" fill="#100b19" stroke="${g}" stroke-width="8"/><text x="220" y="380" fill="${a}" font-size="145" font-family="Arial" font-weight="800">A</text><text x="430" y="380" fill="${b}" font-size="105" font-family="Arial" font-weight="800">ES</text><path d="M215 445h370" stroke="${g}" stroke-width="12"/>`,
    knowledge: `<g fill="#100b19" stroke="${g}" stroke-width="7"><path d="M400 95l105 60v120l-105 60-105-60V155z"/><path d="M175 360l90 52v105l-90 52-90-52V412z"/><path d="M625 360l90 52v105l-90 52-90-52V412z"/><path d="M400 520l95 55v110l-95 55-95-55V575z"/></g><path d="M345 305L230 385M455 305l115 80M235 535l110 65M565 535l-110 65" stroke="${a}" stroke-width="13"/><circle cx="400" cy="215" r="24" fill="${b}"/>`,
    semantic: `<circle cx="315" cy="335" r="215" fill="#100b19" stroke="${g}" stroke-width="10"/><path d="M475 495l190 190" stroke="${a}" stroke-width="35" stroke-linecap="round"/><g fill="${b}"><circle cx="225" cy="270" r="23"/><circle cx="390" cy="245" r="18"/><circle cx="335" cy="410" r="28"/><circle cx="205" cy="430" r="15"/></g><path d="M225 270l165-25-55 165-130 20z" fill="none" stroke="${a}" stroke-width="8"/>`,
    aiguard: `<circle cx="400" cy="400" r="275" fill="#100b19" stroke="${g}" stroke-width="10" stroke-dasharray="25 18"/><rect x="285" y="350" width="230" height="205" rx="35" fill="${b}" opacity=".38" stroke="${a}" stroke-width="8"/><path d="M330 350v-55a70 70 0 01140 0v55" fill="none" stroke="${a}" stroke-width="20"/><g fill="${a}">${[[185,220],[615,220],[175,590],[625,590]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="18"/>`).join("")}</g>`,
    speedometer: `<path d="M105 575a310 310 0 01590 0" fill="none" stroke="${b}" stroke-width="32"/><g stroke="${a}" stroke-width="12">${[-65,-40,-15,10,35,60].map(angle=>`<path d="M400 145v55" transform="rotate(${angle} 400 455)"/>`).join("")}</g><path d="M400 565l-115-180" stroke="${g}" stroke-width="28" stroke-linecap="round"/><circle cx="400" cy="565" r="55" fill="${a}"/><rect x="260" y="650" width="280" height="55" rx="27" fill="${b}" opacity=".55"/>`,
    scorecards: `<g fill="#100b19" stroke="${g}" stroke-width="7"><rect x="70" y="155" width="205" height="490" rx="28"/><rect x="300" y="95" width="205" height="550" rx="28"/><rect x="530" y="220" width="205" height="425" rx="28"/></g><text x="172" y="355" text-anchor="middle" fill="${a}" font-size="70" font-family="Arial" font-weight="800">72</text><text x="402" y="330" text-anchor="middle" fill="${b}" font-size="78" font-family="Arial" font-weight="800">91</text><text x="632" y="405" text-anchor="middle" fill="${a}" font-size="65" font-family="Arial" font-weight="800">64</text><path d="M115 470h115M345 455h115M575 515h115" stroke="${g}" stroke-width="13"/>`,
    bullseye: `<rect x="120" y="130" width="500" height="500" rx="45" fill="#100b19" stroke="${g}" stroke-width="9"/><circle cx="370" cy="380" r="150" fill="none" stroke="${b}" stroke-width="28"/><circle cx="370" cy="380" r="55" fill="${a}"/><path d="M705 95L410 350M705 95l-115 10M705 95l-10 115" stroke="${a}" stroke-width="20"/><path d="M560 665l105-105" stroke="${b}" stroke-width="14"/>`,
    startuplaunch: `<g fill="#100b19" stroke="${g}" stroke-width="7"><path d="M160 605c-35-90-25-190 50-270 75 80 85 180 50 270z"/><path d="M335 535c-45-125-30-265 65-375 95 110 110 250 65 375z"/><path d="M540 620c-30-75-20-165 45-235 65 70 75 160 45 235z"/></g><g fill="${a}"><circle cx="210" cy="430" r="22"/><circle cx="400" cy="310" r="30"/><circle cx="585" cy="470" r="18"/></g><path d="M180 605l30 90 30-90M370 535l30 150 30-150M565 620l20 75 20-75" fill="${b}"/>`,
    industrial: `<path d="M65 675h680M105 675V400l160-90v365M285 675V245l190 105v325M500 675V430l170-85v330" fill="#100b19" stroke="${g}" stroke-width="8"/><path d="M130 270h100M180 270V125M570 300l80-95M650 205v95M610 245h80" stroke="${a}" stroke-width="20"/><path d="M535 585l65-65 55 35 80-120" fill="none" stroke="${b}" stroke-width="14"/>`,
    worldtrade: `<circle cx="360" cy="400" r="250" fill="#100b19" stroke="${g}" stroke-width="8"/><path d="M110 400h500M360 150c-135 120-135 380 0 500M360 150c135 120 135 380 0 500" fill="none" stroke="${a}" stroke-width="7"/><path d="M575 205c100 55 145 145 120 235M690 440l-55-60 80-20M145 590c-75-65-105-155-70-240M75 350l55 60-80 20" fill="none" stroke="${b}" stroke-width="16"/>`,
    riskguard: `<path d="M85 355q315-330 630 0c-75-45-135-5-155 35-45-60-115-60-160 0-45-60-115-60-160 0-20-40-80-80-155-35z" fill="${b}" opacity=".48" stroke="${g}" stroke-width="9"/><path d="M400 360v245c0 95 120 100 120 10" fill="none" stroke="${a}" stroke-width="22"/><g fill="${a}">${[0,1,2,3].map(i=>`<rect x="${125+i*95}" y="${620-i*65}" width="55" height="${65+i*65}" rx="8"/>`).join("")}</g>`,
    horizon: `<circle cx="400" cy="405" r="175" fill="${a}" opacity=".55"/><path d="M60 520q170-150 340 0t340 0v170H60z" fill="#100b19" stroke="${g}" stroke-width="8"/><path d="M90 610h620M400 95v100M185 180l75 75M615 180l-75 75" stroke="${b}" stroke-width="15"/>`,
  };
  if (!Object.hasOwn(variants, type)) throw new Error(`Unknown asset motif: ${type}`);
  return variants[type];
}

await fs.mkdir(output, { recursive: true });
for (const entry of await fs.readdir(output, { withFileTypes: true })) {
  if (entry.isFile() && entry.name.endsWith(".svg")) await fs.rm(path.join(output, entry.name));
}

const manifest = [];
let globalIndex = 0;
for (const [categoryIndex, group] of categories.entries()) {
  for (const [index, [name, motif, tags]] of group.concepts.entries()) {
    const seed = categoryIndex * 31 + index * 7 + 1;
    const fileNumber = String(index + 1).padStart(2, "0");
    const idNumber = String(index + 1).padStart(3, "0");
    const fileName = `${group.file}-${fileNumber}.svg`;
    const svg = frame(draw(motif, group.accent, group.secondary, seed), group.accent, group.secondary, seed);
    await fs.writeFile(path.join(output, fileName), `${svg}\n`);
    manifest.push({
      id: `${group.file}-${idNumber}`,
      name,
      motif,
      path: `/assets/library/${fileName}`,
      category: group.category,
      tags: [...new Set([group.category, group.file, name.replaceAll("-", " "), ...tags])],
      orientation: orientations[(index + categoryIndex) % orientations.length],
      transparent: true,
      compatibleLayouts: index % 5 === 0 ? ["cover", "content", "closing"] : index % 2 === 0 ? ["cover", "content"] : ["content", "closing"],
      placement: placements[(globalIndex * 3 + categoryIndex) % placements.length],
      scale: scales[(index * 2 + categoryIndex) % scales.length],
      rotation: ((seed * 11) % 15) - 7,
      active: true,
    });
    globalIndex++;
  }
}

await fs.mkdir(path.dirname(manifestPath), { recursive: true });
await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Generated ${manifest.length} distinct SVG assets and metadata in ${output}`);
