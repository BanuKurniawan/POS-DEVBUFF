import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];
const ALLOWED_EXTS = ["png", "jpg", "jpeg", "webp", "gif", "svg"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File gambar tidak ditemukan." },
        { status: 400 }
      );
    }

    const ext = (file.name.split(".").pop() || "png").toLowerCase();
    const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTS.includes(ext);

    if (!isValidType) {
      return NextResponse.json(
        { success: false, message: "Format gambar tidak didukung. Gunakan PNG, JPG, JPEG, WebP, atau SVG." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "Ukuran file terlalu besar. Maksimum 5 MB." },
        { status: 400 }
      );
    }

    const uploadsDir = path.resolve(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadsDir, { recursive: true });

    const sanitizedExt = ALLOWED_EXTS.includes(ext) ? ext : "png";
    const randomSuffix = Math.floor(Math.random() * 10000);
    const fileName = `prod-${Date.now()}-${randomSuffix}.${sanitizedExt}`;
    const filePath = path.join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    const imageUrl = `/uploads/products/${fileName}`;

    return NextResponse.json(
      {
        success: true,
        imageUrl,
        message: "Foto produk berhasil diunggah!",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Upload product image error:", error);
    const message = error instanceof Error ? error.message : "Gagal mengunggah foto produk.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

