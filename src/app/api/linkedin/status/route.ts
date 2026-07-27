import { NextResponse } from "next/server";
import { linkedInConfiguration } from "@/lib/linkedin/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const configuration = linkedInConfiguration();
  return NextResponse.json({
    configured: configuration.configured,
    author: configuration.authorUrn
      ? configuration.authorUrn.replace(/^urn:li:/, "")
      : undefined,
    apiVersion: configuration.apiVersion,
  });
}
