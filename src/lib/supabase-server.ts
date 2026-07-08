import { createClient } from "@supabase/supabase-js";

/** Server-only Supabase admin client (Storage). Never expose service role to the browser. */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function isSupabaseStorageEnabled() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export const SUPABASE_UPLOAD_BUCKET =
  process.env.SUPABASE_UPLOAD_BUCKET ?? "uploads";

export const SUPABASE_PRIVATE_BUCKET =
  process.env.SUPABASE_PRIVATE_BUCKET ?? "event-registrations";
