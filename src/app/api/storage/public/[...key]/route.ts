import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { openPublicObject } from "@/lib/storage/r2-ops";
import { isAnonymousFileKey, isBlockedFileKey, isSafeObjectKey } from "@/lib/storage/public-url";

interface RouteParams {
  params: Promise<{ key: string[] }>;
}

function fileName(objectKey: string) {
  const base = objectKey.split("/").pop() ?? "file";
  return base.replace(/[^A-Za-z0-9._-]/g, "_");
}

/** Serve an archive object from private R2. Reports and proofs require a signed-in user. */
export async function GET(request: Request, { params }: RouteParams) {
  const objectKey = (await params).key.map((part) => decodeURIComponent(part)).join("/");
  if (!isSafeObjectKey(objectKey) || isBlockedFileKey(objectKey)) {
    return NextResponse.json({ error: "File is not available." }, { status: 404 });
  }

  const anonymous = isAnonymousFileKey(objectKey);
  if (!anonymous) {
    const { error } = await requireAuth();
    if (error) {
      const accept = request.headers.get("accept") ?? "";
      if (accept.includes("text/html")) {
        const login = new URL("/login", request.url);
        login.searchParams.set("callbackUrl", new URL(request.url).pathname);
        return NextResponse.redirect(login);
      }
      return error;
    }
  }

  try {
    const file = await openPublicObject(objectKey);
    const risky = /^(text\/html|image\/svg|application\/xhtml)/i.test(file.contentType);
    const headers = new Headers({
      "Content-Type": risky ? "application/octet-stream" : file.contentType,
      "Content-Disposition": `${risky ? "attachment" : "inline"}; filename="${fileName(objectKey)}"`,
      "Cache-Control": anonymous ? "public, max-age=86400" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
      "Cross-Origin-Resource-Policy": "same-origin",
    });
    if (file.contentLength != null) {
      headers.set("Content-Length", String(file.contentLength));
    }
    return new Response(file.stream, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "File is not available." }, { status: 404 });
  }
}
