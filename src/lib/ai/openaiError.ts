export type PublicOpenAIError = {
  code: string;
  message: string;
  status: number;
};

type OpenAIErrorLike = {
  status?: unknown;
  code?: unknown;
  type?: unknown;
  message?: unknown;
  error?: unknown;
};

function asRecord(value: unknown): OpenAIErrorLike | null {
  return typeof value === "object" && value !== null ? value as OpenAIErrorLike : null;
}

function asText(value: unknown) {
  return typeof value === "string" ? value : "";
}

/**
 * Converts provider errors into safe, actionable messages without exposing the
 * raw OpenAI response to the browser.
 */
export function toPublicOpenAIError(error: unknown): PublicOpenAIError | null {
  const outer = asRecord(error);
  if (!outer) return null;

  const nested = asRecord(outer.error);
  const status = typeof outer.status === "number" ? outer.status : undefined;
  const providerCode = asText(outer.code) || asText(nested?.code);
  const providerType = asText(outer.type) || asText(nested?.type);
  const providerMessage = asText(outer.message) || asText(nested?.message);
  const fingerprint = `${providerCode} ${providerType} ${providerMessage}`.toLowerCase();

  if (
    status === 429 &&
    (
      fingerprint.includes("insufficient_quota") ||
      fingerprint.includes("exceeded your current quota") ||
      fingerprint.includes("billing")
    )
  ) {
    return {
      code: "OPENAI_QUOTA_EXCEEDED",
      message: "La clave es válida, pero la cuenta o proyecto de OpenAI no tiene saldo disponible o alcanzó su límite de uso. Revisa Billing y Usage limits.",
      status: 429,
    };
  }

  if (status === 429) {
    return {
      code: "OPENAI_RATE_LIMITED",
      message: "OpenAI está recibiendo demasiadas solicitudes. Espera unos segundos e inténtalo de nuevo.",
      status: 429,
    };
  }

  if (status === 401) {
    return {
      code: "OPENAI_AUTHENTICATION_FAILED",
      message: "OpenAI rechazó la clave API. Verifica OPENAI_API_KEY y reinicia la aplicación.",
      status: 401,
    };
  }

  if (status === 403) {
    return {
      code: "OPENAI_PERMISSION_DENIED",
      message: "La clave no tiene permiso para usar el proyecto o modelo configurado en OpenAI.",
      status: 403,
    };
  }

  if (status === 400 || status === 404 || fingerprint.includes("model_not_found")) {
    return {
      code: "OPENAI_REQUEST_INVALID",
      message: "OpenAI rechazó la solicitud. Verifica que OPENAI_MODEL exista y esté habilitado para este proyecto.",
      status: 400,
    };
  }

  if (
    status === undefined &&
    (
      fingerprint.includes("connection error") ||
      fingerprint.includes("connection timeout") ||
      fingerprint.includes("fetch failed")
    )
  ) {
    return {
      code: "OPENAI_UNAVAILABLE",
      message: "No fue posible conectar con OpenAI. Revisa la conexión e inténtalo de nuevo.",
      status: 503,
    };
  }

  if (status !== undefined && status >= 500) {
    return {
      code: "OPENAI_UNAVAILABLE",
      message: "OpenAI no está disponible temporalmente. Inténtalo de nuevo en unos minutos.",
      status: 503,
    };
  }

  return null;
}
