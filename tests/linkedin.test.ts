// @vitest-environment node
import fs from "node:fs/promises";
import { afterEach, describe, expect, it, vi } from "vitest";
import { linkedInConfiguration, publishPdfToLinkedIn } from "@/lib/linkedin/client";

const pdfPath = "/tmp/kalliom-linkedin-test.pdf";

afterEach(async () => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  await fs.rm(pdfPath, { force: true });
});

describe("integración LinkedIn", () => {
  it("distingue una instalación sin credenciales", () => {
    vi.stubEnv("LINKEDIN_ACCESS_TOKEN", "");
    vi.stubEnv("LINKEDIN_AUTHOR_URN", "");
    expect(linkedInConfiguration().configured).toBe(false);
  });

  it("inicializa, carga el PDF y crea el post de documento", async () => {
    vi.stubEnv("LINKEDIN_ACCESS_TOKEN", "token-de-prueba");
    vi.stubEnv("LINKEDIN_AUTHOR_URN", "urn:li:organization:123456");
    vi.stubEnv("LINKEDIN_API_VERSION", "202605");
    await fs.writeFile(pdfPath, "%PDF-test");
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string | URL, init?: RequestInit) => {
      requests.push({ url: String(url), init });
      if (String(url).includes("initializeUpload")) {
        return new Response(JSON.stringify({ value: { uploadUrl: "https://upload.linkedin.test/document", document: "urn:li:document:test" } }), { status: 200 });
      }
      if (String(url).includes("upload.linkedin.test")) return new Response(null, { status: 201 });
      return new Response(null, { status: 201, headers: { "x-restli-id": "urn:li:share:test" } });
    }));

    const result = await publishPdfToLinkedIn({ pdfPath, title: "Carrusel", commentary: "Texto del post" });

    expect(result.postId).toBe("urn:li:share:test");
    expect(requests.map((request) => request.url)).toEqual([
      "https://api.linkedin.com/rest/documents?action=initializeUpload",
      "https://upload.linkedin.test/document",
      "https://api.linkedin.com/rest/posts",
    ]);
    const post = JSON.parse(String(requests[2]?.init?.body));
    expect(post.content.media.id).toBe("urn:li:document:test");
    expect(post.lifecycleState).toBe("PUBLISHED");
  });
});
