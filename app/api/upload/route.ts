import { NextRequest, NextResponse } from "next/server";
import { uploadMediaFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "questions";

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan dalam permintaan." }, { status: 400 });
    }

    const url = await uploadMediaFile(file, folder);
    return NextResponse.json({ url, success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Gagal mengunggah file media ke storage." },
      { status: 500 }
    );
  }
}
