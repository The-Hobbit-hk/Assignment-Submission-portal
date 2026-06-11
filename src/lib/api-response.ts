import { NextResponse } from "next/server";

export function jsonCached(
  data: unknown,
  options?: { maxAge?: number; status?: number }
) {
  const maxAge = options?.maxAge ?? 60;
  return NextResponse.json(data, {
    status: options?.status,
    headers: {
      "Cache-Control": `private, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}
