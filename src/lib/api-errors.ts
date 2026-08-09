import { NextResponse } from "next/server";
import type { ZodError } from "zod";
import { zodFirstError } from "@/lib/api-client";

export const API_MESSAGES = {
  unauthorized: "Please sign in to continue.",
  forbidden: "You don't have permission to do this.",
  notFound: "The requested item was not found.",
  invalidRequest: "Invalid request. Please check your input.",
  internal: "Something went wrong. Please try again.",
} as const;

export function apiError(
  message: string,
  status = 400,
  details?: unknown
) {
  return NextResponse.json(
    details === undefined ? { error: message } : { error: message, details },
    { status }
  );
}

export function unauthorized(message: string = API_MESSAGES.unauthorized) {
  return apiError(message, 401);
}

export function forbidden(message: string = API_MESSAGES.forbidden) {
  return apiError(message, 403);
}

export function tooManyRequests(
  message = "Too many requests. Please try again later.",
  retryAfterSec?: number
) {
  const headers: Record<string, string> = {};
  if (retryAfterSec) {
    headers["Retry-After"] = String(retryAfterSec);
  }
  return NextResponse.json({ error: message }, { status: 429, headers });
}

export function notFound(message: string = API_MESSAGES.notFound) {
  return apiError(message, 404);
}

export function validationError(error: ZodError) {
  return apiError(zodFirstError(error), 400, error.flatten());
}

function sanitizePrismaClientError(message: string): { message: string; status: number } | "fallback" | null {
  if (/invalid input value for enum ["']?EventType["']?/i.test(message)) {
    return {
      message:
        "That event type is not available in the database yet. Please refresh and try again, or pick another type.",
      status: 400,
    };
  }
  if (/invalid input value for enum/i.test(message)) {
    return {
      message:
        "One of the selected values is not supported. Please refresh the page and try again.",
      status: 400,
    };
  }
  // Never show raw Prisma invocation dumps to clubs/council.
  if (/Invalid[`\s]*prisma\./i.test(message) || /invocation:/i.test(message)) {
    return "fallback";
  }
  return null;
}

export function handleRouteError(
  error: unknown,
  fallback: string = API_MESSAGES.internal
) {
  console.error("[api]", error);

  if (error instanceof SyntaxError) {
    return apiError("Invalid JSON in request body.", 400);
  }

  if (error instanceof Error && error.message.trim()) {
    const msg = error.message;
    const sanitized = sanitizePrismaClientError(msg);
    if (sanitized === "fallback") {
      return apiError(fallback, 500);
    }
    if (sanitized) {
      return apiError(sanitized.message, sanitized.status);
    }
    if (/too large|exceeds maximum size|payload/i.test(msg)) {
      return apiError(msg, 413);
    }
    if (/not allowed|invalid|required|not found|not configured/i.test(msg)) {
      return apiError(msg, 400);
    }
  }

  return apiError(fallback, 500);
}
