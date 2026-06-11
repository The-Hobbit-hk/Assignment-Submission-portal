import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_UPLOAD_BUCKET,
} from "@/lib/supabase-server";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");

export async function saveUpload(
  file: File,
  subfolder: string,
  maxBytes = 5 * 1024 * 1024
): Promise<string> {
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`File exceeds maximum size of ${mb}MB.`);
  }

  if (isSupabaseStorageEnabled()) {
    return saveUploadToSupabase(file, subfolder);
  }

  if (process.env.VERCEL) {
    throw new Error(
      "File uploads require Supabase Storage in production. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel."
    );
  }

  return saveUploadToDisk(file, subfolder);
}

async function saveUploadToSupabase(file: File, subfolder: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase Storage is not configured.");
  }

  const ext = path.extname(file.name) || getExtFromMime(file.type);
  const objectPath = `${subfolder}/${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(SUPABASE_UPLOAD_BUCKET)
    .upload(objectPath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(SUPABASE_UPLOAD_BUCKET).getPublicUrl(objectPath);
  return data.publicUrl;
}

async function saveUploadToDisk(file: File, subfolder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = path.extname(file.name) || getExtFromMime(file.type);
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(UPLOAD_ROOT, subfolder);

  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subfolder}/${filename}`;
}

function getExtFromMime(mime: string) {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
  };
  return map[mime] ?? "";
}
