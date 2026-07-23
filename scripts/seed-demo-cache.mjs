import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import path from "node:path";

const input = {
  topic: "cómo automatizar una pyme sin perder el trato humano",
  slideCount: 5,
  category: "automation",
  language: "es",
  tone: "professional",
};
const normalizedInput = JSON.stringify(input);
const key = createHash("sha256").update(normalizedInput).digest("hex");
const output = {
  title: "Automatiza sin perder el trato humano",
  subtitle: "Un sistema útil libera tiempo para conversaciones de mayor valor",
  category: "automation",
  slides: [
    { type: "cover", title: "Automatiza sin perder el trato humano", subtitle: "Un sistema útil libera tiempo para conversaciones de mayor valor", visualTags: ["automation", "business", "connection"] },
    { type: "content", number: 1, title: "Empieza por una tarea repetitiva", body: "Elige un proceso frecuente, medible y sencillo de supervisar antes de automatizar operaciones críticas.", highlight: "Primero claridad. Después tecnología.", visualTags: ["workflow", "process", "automation"] },
    { type: "content", number: 2, title: "Define cuándo debe intervenir una persona", body: "Las excepciones, decisiones sensibles y conversaciones complejas necesitan criterios claros para pasar al equipo.", highlight: "Automatizar también significa saber cuándo detenerse.", visualTags: ["connection", "team", "system"] },
    { type: "content", number: 3, title: "Mide tiempo recuperado, no tareas ejecutadas", body: "Evalúa cuánto trabajo manual desaparece y cómo utiliza el equipo el tiempo que acaba de recuperar.", highlight: "La eficiencia debe convertirse en valor.", visualTags: ["analytics", "efficiency", "growth"] },
    { type: "closing", title: "La automatización debe hacer más humano el trabajo", body: "Usa la tecnología para quitar fricción y devolver atención a las decisiones que importan.", cta: "¿Qué proceso automatizarías primero?", visualTags: ["business", "future", "connection"] },
  ],
  linkedin: {
    hook: "Automatizar no consiste en alejar a las personas.",
    body: "Consiste en retirar tareas repetitivas para que el equipo pueda concentrarse en decisiones, excepciones y conversaciones de mayor valor.",
    question: "¿Qué proceso automatizarías primero?",
    hashtags: ["#Automatización", "#Pymes", "#TransformaciónDigital"],
  },
};

const database = new Database(path.resolve("prisma/dev.db"));
database.prepare(`
  INSERT INTO GenerationCache (key, normalizedInput, requestJson, responseJson, model, inputTokens, outputTokens, createdAt)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(key) DO UPDATE SET responseJson = excluded.responseJson
`).run(key, normalizedInput, JSON.stringify({ fixture: true }), JSON.stringify(output), "fixture-local", 0, 0, new Date().toISOString());
database.close();
console.log(`Seeded demo cache ${key.slice(0, 12)}…`);
