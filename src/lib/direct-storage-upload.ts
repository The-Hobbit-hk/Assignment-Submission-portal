import { ApiError } from "@/lib/api-client";

/** Normalize phone/browser MIME quirks before signing uploads. */
export function guessContentType(fileName: string, type?: string | null): string {
  const raw = (type || "").trim().toLowerCase();
  if (raw === "image/jpg") return "image/jpeg";
  if (raw && raw !== "application/octet-stream") return raw;

  const dot = fileName.lastIndexOf(".");
  const ext = dot >= 0 ? fileName.slice(dot).toLowerCase() : "";
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  return map[ext] ?? "application/octet-stream";
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function isStorageNotConfiguredError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.status !== 500 && err.status !== 503) return false;
  return /Supabase Storage|storage is not configured|Direct uploads require/i.test(
    err.message
  );
}

/** True when multipart through Vercel is likely to fail (body limit ~4.5 MB). */
export function shouldAvoidMultipartFallback(fileSizeBytes: number): boolean {
  return fileSizeBytes > 3.5 * 1024 * 1024;
}

export async function withRetries<T>(
  fn: () => Promise<T>,
  attempts = 3,
  label = "Request"
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const status = err instanceof ApiError ? err.status : undefined;
      // Do not retry auth/validation errors.
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
        throw err;
      }
      if (i < attempts - 1) {
        await sleep(400 * 2 ** i);
      }
    }
  }
  if (lastErr instanceof ApiError) throw lastErr;
  throw new ApiError(
    `${label} failed after several tries. Please wait a moment and try again.`,
    0
  );
}

/**
 * PUT a file to a Supabase signed upload URL with retries.
 * Omits custom headers that often break CORS preflight (e.g. x-upsert).
 */
export async function putFileToSignedUrl(
  file: File,
  signedUrl: string,
  contentType: string,
  attempts = 3
): Promise<void> {
  let lastErr: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      const put = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType || "application/octet-stream",
        },
        body: file,
      });

      if (put.ok) return;

      const detail = await put.text().catch(() => "");
      const message =
        detail.trim() ||
        "Could not upload file to storage. Please try again with a smaller file.";
      const err = new ApiError(message, put.status || 500);
      if (put.status >= 400 && put.status < 500 && put.status !== 408 && put.status !== 429) {
        throw err;
      }
      lastErr = err;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status >= 400 && err.status < 500 && err.status !== 408 && err.status !== 429) {
          throw err;
        }
        lastErr = err;
      } else {
        lastErr = new ApiError(
          "Upload interrupted. Check your connection and try again.",
          0
        );
      }
    }

    if (i < attempts - 1) {
      await sleep(500 * 2 ** i);
    }
  }

  if (lastErr instanceof ApiError) throw lastErr;
  throw new ApiError("Could not upload file to storage. Please try again.", 0);
}
