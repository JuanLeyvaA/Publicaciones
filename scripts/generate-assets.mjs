import fs from "node:fs/promises";
import path from "node:path";

const output = path.resolve("public/assets/library");
const categories = [
  { name: "automation", accent: "#f4a62f", secondary: "#a76cf6", motif: "nodes" },
  { name: "web", accent: "#a76cf6", secondary: "#f4a62f", motif: "window" },
  { name: "ai", accent: "#c18cff", secondary: "#f4a62f", motif: "brain" },
  { name: "analytics", accent: "#f4a62f", secondary: "#8f5ae8", motif: "bars" },
  { name: "business", accent: "#e29a31", secondary: "#a76cf6", motif: "buildings" },
];

function motif(type, index, accent, secondary) {
  const shift = index * 9;
  if (type === "window") return `<rect x=\"120\" y=\"160\" width=\"400\" height=\"450\" rx=\"28\" fill=\"#100b19\" stroke=\"${accent}\" stroke-width=\"4\"/><circle cx=\"158\" cy=\"198\" r=\"8\" fill=\"${accent}\"/><circle cx=\"186\" cy=\"198\" r=\"8\" fill=\"${secondary}\"/><path d=\"M155 270h220M155 320h320M155 370h260M155 455h110v110H155zM292 455h193v45H292zM292 520h150v45H292z\" stroke=\"url(#g)\" stroke-width=\"18\" stroke-linecap=\"round\" fill=\"none\"/>`;
  if (type === "brain") return `<path d=\"M320 ${145 + shift}c-92-70-210 25-166 120-90 38-74 176 22 182-18 104 110 154 168 74 68 82 198 22 169-78 94-35 86-169-8-190 24-105-104-172-185-108z\" fill=\"#110b1c\" stroke=\"url(#g)\" stroke-width=\"5\"/><g fill=\"${accent}\"><circle cx=\"230\" cy=\"260\" r=\"12\"/><circle cx=\"390\" cy=\"230\" r=\"12\"/><circle cx=\"470\" cy=\"350\" r=\"12\"/><circle cx=\"300\" cy=\"425\" r=\"12\"/></g><path d=\"M230 260l160-30 80 120-170 75-70-165z\" stroke=\"${secondary}\" stroke-width=\"5\" fill=\"none\"/>`;
  if (type === "bars") return `<path d=\"M130 600V220M130 600h410\" stroke=\"#766985\" stroke-width=\"5\"/><rect x=\"180\" y=\"${450-shift}\" width=\"62\" height=\"150\" rx=\"10\" fill=\"${accent}\"/><rect x=\"280\" y=\"${360-shift}\" width=\"62\" height=\"240\" rx=\"10\" fill=\"${secondary}\"/><rect x=\"380\" y=\"${270-shift}\" width=\"62\" height=\"330\" rx=\"10\" fill=\"url(#g)\"/><path d=\"M180 370l115-90 105 25 120-140\" stroke=\"#f7efe5\" stroke-width=\"8\" fill=\"none\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>`;
  if (type === "buildings") {
    const windows = Array.from({ length: 12 }, (_, index) => {
      const x = 305 + (index % 3) * 38;
      const y = 300 + Math.floor(index / 3) * 58;
      return `<rect x="${x}" y="${y}" width="17" height="25" rx="3"/>`;
    }).join("");
    return `<path d="M135 610V330l120-70v350M275 610V180l150 80v350M445 610V360l90-45v295" fill="#110b1c" stroke="url(#g)" stroke-width="5"/><g fill="${accent}">${windows}</g><circle cx="215" cy="205" r="44" fill="none" stroke="${secondary}" stroke-width="7"/>`;
  }
  return `<g fill=\"none\" stroke=\"url(#g)\" stroke-width=\"7\"><circle cx=\"320\" cy=\"380\" r=\"88\"/><circle cx=\"170\" cy=\"220\" r=\"42\"/><circle cx=\"500\" cy=\"250\" r=\"48\"/><circle cx=\"175\" cy=\"560\" r=\"48\"/><circle cx=\"500\" cy=\"555\" r=\"42\"/><path d=\"M205 245l75 88M455 280l-92 66M215 535l70-100M462 530l-100-102\"/></g><circle cx=\"320\" cy=\"380\" r=\"27\" fill=\"${accent}\"/><g fill=\"${secondary}\"><circle cx=\"170\" cy=\"220\" r=\"12\"/><circle cx=\"500\" cy=\"250\" r=\"12\"/><circle cx=\"175\" cy=\"560\" r=\"12\"/><circle cx=\"500\" cy=\"555\" r=\"12\"/></g>`;
}

await fs.mkdir(output, { recursive: true });
for (const category of categories) {
  for (let index = 1; index <= 8; index++) {
    const rotation = index * 17;
    const svg = `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 640 800\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"${category.accent}\"/><stop offset=\"1\" stop-color=\"${category.secondary}\"/></linearGradient><radialGradient id=\"r\"><stop stop-color=\"${category.secondary}\" stop-opacity=\".3\"/><stop offset=\"1\" stop-color=\"#08070d\" stop-opacity=\"0\"/></radialGradient></defs><circle cx=\"320\" cy=\"390\" r=\"300\" fill=\"url(#r)\"/><g opacity=\".24\" transform=\"rotate(${rotation} 320 400)\"><circle cx=\"320\" cy=\"400\" r=\"270\" fill=\"none\" stroke=\"${category.accent}\"/><circle cx=\"320\" cy=\"400\" r=\"220\" fill=\"none\" stroke=\"${category.secondary}\" stroke-dasharray=\"8 18\"/></g>${motif(category.motif,index,category.accent,category.secondary)}</svg>`;
    await fs.writeFile(path.join(output, `${category.name}-${String(index).padStart(2, "0")}.svg`), svg);
  }
}
console.log(`Generated 40 local SVG assets in ${output}`);
