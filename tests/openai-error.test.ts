import { describe, expect, it } from "vitest";
import { toPublicOpenAIError } from "@/lib/ai/openaiError";

describe("errores públicos de OpenAI", () => {
  it("distingue cuota agotada de un rate limit temporal", () => {
    expect(toPublicOpenAIError({
      status: 429,
      code: "insufficient_quota",
      message: "You exceeded your current quota.",
    })).toMatchObject({
      code: "OPENAI_QUOTA_EXCEEDED",
      status: 429,
    });

    expect(toPublicOpenAIError({
      status: 429,
      code: "rate_limit_exceeded",
      message: "Rate limit reached for requests.",
    })).toMatchObject({
      code: "OPENAI_RATE_LIMITED",
      status: 429,
    });
  });

  it("explica los errores de autenticación sin filtrar la respuesta original", () => {
    const result = toPublicOpenAIError({
      status: 401,
      message: "Incorrect API key provided: secret-value",
    });

    expect(result).toEqual({
      code: "OPENAI_AUTHENTICATION_FAILED",
      message: "OpenAI rechazó la clave API. Verifica OPENAI_API_KEY y reinicia la aplicación.",
      status: 401,
    });
    expect(result?.message).not.toContain("secret-value");
  });

  it("ignora errores que no provienen de la API", () => {
    expect(toPublicOpenAIError(new Error("fallo local"))).toBeNull();
  });
});
