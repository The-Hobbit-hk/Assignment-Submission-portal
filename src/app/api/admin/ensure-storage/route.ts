import { NextResponse } from "next/server";
import { requireRole } from "@/lib/api-auth";
import { getSupabaseAdmin, SUPABASE_UPLOAD_BUCKET } from "@/lib/supabase-server";
import { DISTRICT_ROLES } from "@/lib/roles";

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
    return NextResponse.json(
      {
        error:
          "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on Vercel.",
      },
      { status: 500 }
    );
  }

  const bucket = SUPABASE_UPLOAD_BUCKET;

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 });
  }

  const exists = buckets?.some((b) => b.name === bucket || b.id === bucket);
  if (exists) {
    return NextResponse.json({
      ok: true,
      message: `Storage bucket "${bucket}" already exists.`,
      bucket,
    });
  }

  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 8 * 1024 * 1024,
    allowedMimeTypes: ALLOWED_MIME,
  });

  if (createError) {
    return NextResponse.json(
      {
        error: createError.message,
        hint: "If API create fails, run supabase/storage-setup.sql in Supabase SQL Editor.",
      },
      { status: 500 }
    );
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
