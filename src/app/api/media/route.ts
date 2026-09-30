import { randomUUID } from "node:crypto";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const acceptedTypes: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const maxBytes = 8 * 1024 * 1024;

export async function GET() {
  try {
    const directory = path.join(process.cwd(), "public", "uploads");
    const files = await readdir(directory, { withFileTypes: true });
    const urls = files
      .filter((file) => file.isFile() && /\.(jpg|png|webp)$/i.test(file.name))
      .map((file) => `/uploads/${file.name}`)
      .sort();
    return NextResponse.json({ urls });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return NextResponse.json({ urls: [] });
    return NextResponse.json({ error: "No fue posible cargar la biblioteca de visuales." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const files = form.getAll("images").filter((value): value is File => value instanceof File);
    if (!files.length || files.length > 6) return NextResponse.json({ error: "Carga entre 1 y 6 imágenes." }, { status: 400 });
    if (files.some((file) => !acceptedTypes[file.type] || file.size > maxBytes)) {
      return NextResponse.json({ error: "Usa JPG, PNG o WEBP de hasta 8 MB por imagen." }, { status: 400 });
    }
    const directory = path.join(process.cwd(), "public", "uploads");
    await mkdir(directory, { recursive: true });
    const urls = await Promise.all(files.map(async (file) => {
      const extension = acceptedTypes[file.type]!;
      const filename = `${randomUUID()}.${extension}`;
      await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
      return `/uploads/${filename}`;
    }));
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ error: "No fue posible cargar las imágenes." }, { status: 500 });
  }
}
