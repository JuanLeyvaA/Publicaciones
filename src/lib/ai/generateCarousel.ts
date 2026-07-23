import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { aiCarouselSchema, AiOutputError, validateOutputForInput, type AiCarouselOutput, type CreateCarouselInput } from "@/lib/ai/schemas";
import { buildCarouselPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompt";

export type GenerationUsage = { inputTokens: number; outputTokens: number; calls: number; model: string };
export type GenerationResult = { output: AiCarouselOutput; raw: string; usage: GenerationUsage };

export interface CarouselModel {
  generate(input: CreateCarouselInput): Promise<GenerationResult>;
}

function parseRawOutput(raw: string) {
  let json: unknown;
  try { json = JSON.parse(raw); }
  catch { throw new AiOutputError("INVALID_JSON", "El modelo no devolvió JSON válido."); }
  const parsed = aiCarouselSchema.safeParse(json);
  if (!parsed.success) throw new AiOutputError("INVALID_SCHEMA", "El JSON del modelo no cumple el esquema requerido.");
  return parsed.data;
}

export class OpenAICarouselModel implements CarouselModel {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: { apiKey?: string; model?: string } = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY_NOT_CONFIGURED");
    this.client = new OpenAI({ apiKey });
    this.model = options.model ?? process.env.OPENAI_MODEL ?? "gpt-5.6-luna";
  }

  async generate(input: CreateCarouselInput): Promise<GenerationResult> {
    const first = await this.request([
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "user" as const, content: buildCarouselPrompt(input) },
    ]);
    let calls = 1;
    let output: AiCarouselOutput;
    if (first.parsed) {
      output = first.parsed;
    } else {
      try {
        output = parseRawOutput(first.raw);
      } catch (error) {
        if (!(error instanceof AiOutputError) || error.code !== "INVALID_JSON" || !first.raw.trim()) throw error;
        const repaired = await this.request([
          { role: "system" as const, content: "Corrige únicamente la estructura del JSON. Conserva el contenido. Devuelve solo el objeto corregido." },
          { role: "user" as const, content: first.raw.slice(0, 12_000) },
        ]);
        calls++;
        output = repaired.parsed ?? parseRawOutput(repaired.raw);
        first.inputTokens += repaired.inputTokens;
        first.outputTokens += repaired.outputTokens;
      }
    }
    validateOutputForInput(input, output);
    return {
      output,
      raw: JSON.stringify(output),
      usage: { inputTokens: first.inputTokens, outputTokens: first.outputTokens, calls, model: this.model },
    };
  }

  private async request(input: Array<{ role: "system" | "user"; content: string }>) {
    const response = await this.client.responses.parse({
      model: this.model,
      input,
      reasoning: { effort: "low" },
      text: {
        verbosity: "low",
        format: zodTextFormat(aiCarouselSchema, "kalliom_carousel"),
      },
    });
    return {
      parsed: response.output_parsed,
      raw: response.output_text,
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    };
  }
}
