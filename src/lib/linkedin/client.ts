import fs from "node:fs/promises";

export class LinkedInError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "LinkedInError";
  }
}

export function linkedInConfiguration() {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN?.trim();
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN?.trim();
  const apiVersion = process.env.LINKEDIN_API_VERSION?.trim() || "202605";
  return {
    configured: Boolean(accessToken && authorUrn),
    accessToken,
    authorUrn,
    apiVersion,
  };
}

function configurationOrThrow() {
  const configuration = linkedInConfiguration();
  if (!configuration.accessToken || !configuration.authorUrn) {
    throw new LinkedInError("LinkedIn no está conectado. Configura LINKEDIN_ACCESS_TOKEN y LINKEDIN_AUTHOR_URN.");
  }
  if (!/^urn:li:(organization|person):[A-Za-z0-9_-]+$/.test(configuration.authorUrn)) {
    throw new LinkedInError("LINKEDIN_AUTHOR_URN debe ser un URN de organización o persona válido.");
  }
  return {
    accessToken: configuration.accessToken,
    authorUrn: configuration.authorUrn,
    apiVersion: configuration.apiVersion,
  };
}

async function responseError(response: Response, operation: string) {
  const body = await response.text();
  let detail = body.slice(0, 350);
  try {
    const parsed = JSON.parse(body) as { message?: string; errorDetailType?: string };
    detail = parsed.message || parsed.errorDetailType || detail;
  } catch {}
  return new LinkedInError(`${operation} falló (${response.status})${detail ? `: ${detail}` : "."}`, response.status);
}

export async function publishPdfToLinkedIn(input: {
  pdfPath: string;
  title: string;
  commentary: string;
}) {
  const { accessToken, authorUrn, apiVersion } = configurationOrThrow();
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Linkedin-Version": apiVersion,
    "X-Restli-Protocol-Version": "2.0.0",
  };
  const initialize = await fetch("https://api.linkedin.com/rest/documents?action=initializeUpload", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ initializeUploadRequest: { owner: authorUrn } }),
  });
  if (!initialize.ok) throw await responseError(initialize, "La inicialización del PDF");
  const initialization = await initialize.json() as {
    value?: { uploadUrl?: string; document?: string };
  };
  const uploadUrl = initialization.value?.uploadUrl;
  const documentUrn = initialization.value?.document;
  if (!uploadUrl || !documentUrn) throw new LinkedInError("LinkedIn no devolvió una URL y un URN para el documento.");

  const pdf = await fs.readFile(input.pdfPath);
  const upload = await fetch(uploadUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/pdf" },
    body: new Uint8Array(pdf),
  });
  if (!upload.ok) throw await responseError(upload, "La carga del PDF");

  const post = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      author: authorUrn,
      commentary: input.commentary.slice(0, 3000),
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        media: {
          title: input.title.slice(0, 200),
          id: documentUrn,
        },
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });
  if (!post.ok) throw await responseError(post, "La publicación");
  const postId = post.headers.get("x-restli-id");
  if (!postId) throw new LinkedInError("LinkedIn publicó el contenido pero no devolvió el identificador del post.");
  return { postId, documentUrn };
}
