import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { getSupabaseAdmin, SUPABASE_UPLOAD_BUCKET } from "@/lib/supabase-server";
import { DISTRICT_ROLES } from "@/lib/roles";
import { apiError, handleRouteError } from "@/lib/api-errors";

const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

/** One-time setup: create the Supabase Storage bucket on production. District admin only. */
export async function POST() {
  const { error } = await requireRole(["DISTRICT_SECRETARY", ...DISTRICT_ROLES]);
  if (error) return error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return apiError(
      "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel.",
      500
    );
  }

  const bucket = SUPABASE_UPLOAD_BUCKET;

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    return handleRouteError(listError, "Failed to ensure storage.");
  }

  const exists = buckets?.some((b) => b.name === bucket || b.id === bucket);
  if (exists) {
    await supabase.storage.updateBucket(bucket, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ALLOWED_MIME,
    });
    return NextResponse.json({
      ok: true,
      message: `Storage bucket "${bucket}" already exists (limit refreshed to 10 MB).`,
      bucket,
    });
  }

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ALLOWED_MIME,
  });

  if (createError) {
    return apiError(createError.message, 500, {
      hint: "If API create fails, run supabase/storage-setup.sql in Supabase SQL Editor.",
    });
  }

  return NextResponse.json({
    ok: true,
    message: `Created storage bucket "${bucket}". File uploads should work now.`,
    bucket,
  });
}

export async function GET() {
  return POST();
}
