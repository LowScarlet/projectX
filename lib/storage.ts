import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

export async function uploadMediaFile(file: File, folder: string = "questions"): Promise<string> {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  // 1. Jika token Vercel Blob tersedia, gunakan Vercel Blob
  if (blobToken && blobToken.trim().length > 0) {
    try {
      const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const blob = await put(fileName, file, {
        access: "public",
        token: blobToken,
      });
      return blob.url;
    } catch (error) {
      console.warn("Gagal upload ke Vercel Blob, beralih ke local storage fallback:", error);
    }
  }

  // 2. Fallback: Simpan ke folder public/uploads lokal
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = path.join(uploadsDir, safeName);
    await fs.writeFile(filePath, buffer);

    return `/uploads/${folder}/${safeName}`;
  } catch (error) {
    console.error("Gagal menyimpan file ke local storage:", error);
    throw new Error("Gagal mengunggah file media.");
  }
}
