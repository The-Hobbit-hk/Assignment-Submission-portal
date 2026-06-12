import type { ZodError } from "zod";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please check your input.",
  401: "Please sign in to continue.",
  403: "You don't have permission to do this.",
  404: "The requested item was not found.",
  409: "This action conflicts with existing data.",
  413: "The file is too large.",
  422: "Some fields are invalid. Please review and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong. Please try again.",
  503: "Service is temporarily unavailable. Please try again shortly.",
};

function messageFromDetails(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;

  const record = details as Record<string, unknown>;
  const fieldErrors = record.fieldErrors;
  if (fieldErrors && typeof fieldErrors === "object") {
    for (const messages of Object.values(fieldErrors as Record<string, unknown>)) {
      if (Array.isArray(messages) && typeof messages[0] === "string") {
        return messages[0];
      }
    }
  }

  const formErrors = record.formErrors;
  if (Array.isArray(formErrors) && typeof formErrors[0] === "string") {
    return formErrors[0];
  }

  return null;
}

export async function parseApiErrorResponse(
  res: Response,
  fallback?: string
): Promise<string> {
  const defaultMessage =
    fallback ?? STATUS_MESSAGES[res.status] ?? "Something went wrong. Please try again.";

  try {
    const data = (await res.json()) as {
      error?: unknown;
      message?: unknown;
      details?: unknown;
    };

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    const detailsMessage = messageFromDetails(data.details);
    if (detailsMessage) return detailsMessage;
  } catch {
    // Response body is not JSON — use status-based fallback.
  }

  return defaultMessage;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
}

export function zodFirstError(error: ZodError): string {
  return error.issues[0]?.message ?? "Invalid request. Please check your input.";
}

export async function apiJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);

  if (!res.ok) {
    throw new ApiError(await parseApiErrorResponse(res), res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
