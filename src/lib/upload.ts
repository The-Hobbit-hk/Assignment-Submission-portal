import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  getSupabaseAdmin,
  isSupabaseStorageEnabled,
  SUPABASE_PRIVATE_BUCKET,
  SUPABASE_UPLOAD_BUCKET,
} from "@/lib/supabase-server";

const UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const PRIVATE_UPLOAD_ROOT = path.join(process.cwd(), "private-uploads");

export const REGISTRATION_FILE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export function isRegistrationFile(file: File): boolean {
  return REGISTRATION_FILE_MIME_TYPES.includes(
    file.type as (typeof REGISTRATION_FILE_MIME_TYPES)[number]
  );
}

/** Store sensitive files (govt ID, payment proof) — not publicly accessible. */
export async function savePrivateUpload(
  file: File,
  subfolder: string,
  maxBytes = 5 * 1024 * 1024
): Promise<string> {
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`File exceeds maximum size of ${mb}MB.`);
  }
  if (!isRegistrationFile(file)) {
    throw new Error("Only JPG, PNG, WebP, or PDF files are allowed.");
  }

  if (isSupabaseStorageEnabled()) {
    return savePrivateUploadToSupabase(file, subfolder);
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Private file uploads require Supabase Storage in production. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel."
    );
  }

  return savePrivateUploadToDisk(file, subfolder);
}

export async function readPrivateUpload(
  storagePath: string
): Promise<{ buffer: Buffer; contentType: string }> {
  if (isSupabaseStorageEnabled()) {
    return readPrivateUploadFromSupabase(storagePath);
  }
  return readPrivateUploadFromDisk(storagePath);
}

async function savePrivateUploadToSupabase(file: File, subfolder: string): Promise<string> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase Storage is not configured.");
  }

  const ext = path.extname(file.name) || getExtFromMime(file.type);
  const objectPath = `${subfolder}/${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(SUPABASE_PRIVATE_BUCKET)
    .upload(objectPath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return objectPath;
}

async function readPrivateUploadFromSupabase(
  storagePath: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    throw new Error("Supabase Storage is not configured.");
  }

  const { data, error } = await supabase.storage
    .from(SUPABASE_PRIVATE_BUCKET)
    .download(storagePath);

  if (error || !data) {
    throw new Error(error?.message ?? "File not found.");
  }

  const buffer = Buffer.from(await data.arrayBuffer());
  const contentType = data.type || mimeFromPath(storagePath);
  return { buffer, contentType };
}

async function savePrivateUploadToDisk(file: File, subfolder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || getExtFromMime(file.type);
  const filename = `${randomUUID()}${ext}`;
  const dir = path.join(PRIVATE_UPLOAD_ROOT, subfolder);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `${subfolder}/${filename}`;
}

async function readPrivateUploadFromDisk(
  storagePath: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const fullPath = path.join(PRIVATE_UPLOAD_ROOT, storagePath);
  const buffer = await readFile(fullPath);
  return { buffer, contentType: mimeFromPath(storagePath) };
}

function mimeFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
  };
  return map[ext] ?? "application/octet-stream";
}

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
    if (error.message.toLowerCase().includes("bucket not found")) {
      throw new Error(
        'Storage bucket not found. Run "npm run db:ensure-storage" or supabase/storage-setup.sql in Supabase.'
      );
    }
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

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

/** True when the uploaded file is an allowed profile/logo image. */
export function isImageFile(file: File): boolean {
  return IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number]);
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
