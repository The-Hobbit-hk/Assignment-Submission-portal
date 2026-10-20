import { NextResponse } from "next/server";
import { openPublicObject } from "@/lib/storage/r2-ops";
import { isSafeObjectKey } from "@/lib/storage/public-url";

interface RouteParams {
  params: Promise<{ key: string[] }>;
}

/** Serve a public archive object from R2. The address stays on this site. */
export async function GET(_request: Request, { params }: RouteParams) {
  const objectKey = (await params).key.map((part) => decodeURIComponent(part)).join("/");
  if (!isSafeObjectKey(objectKey)) {
    return NextResponse.json({ error: "Invalid file." }, { status: 400 });
  }

  try {
    const file = await openPublicObject(objectKey);
    const headers = new Headers({
      "Content-Type": file.contentType,
      "Cache-Control": "public, max-age=86400",
      "Content-Disposition": "inline",
    });
    if (file.contentLength != null) {
      headers.set("Content-Length", String(file.contentLength));
    }
    return new Response(file.stream, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "File is not available." }, { status: 404 });
  }
}
