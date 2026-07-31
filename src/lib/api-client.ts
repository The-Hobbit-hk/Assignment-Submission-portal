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
  413: "This file is too large. Please upload a smaller file (max 4 MB).",
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

function messageFromUnknownErrorField(error: unknown): string | null {
  if (typeof error === "string" && error.trim()) return error.trim();
  if (!error || typeof error !== "object") return null;
  const record = error as Record<string, unknown>;
  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }
  if (typeof record.code === "string" && /PAYLOAD_TOO_LARGE|ENTITY_TOO_LARGE/i.test(record.code)) {
    return STATUS_MESSAGES[413];
  }
  return null;
}

function isPayloadTooLargePayload(data: Record<string, unknown>, status: number): boolean {
  if (status === 413) return true;
  const blob = JSON.stringify(data);
  return /FUNCTION_PAYLOAD_TOO_LARGE|Request Entity Too Large|ENTITY_TOO_LARGE/i.test(blob);
}

export async function parseApiErrorResponse(
  res: Response,
  fallback?: string
): Promise<string> {
  const defaultMessage =
    fallback ?? STATUS_MESSAGES[res.status] ?? "Something went wrong. Please try again.";

  try {
    const text = await res.text();
    if (!text.trim()) {
      return res.status === 413 ? STATUS_MESSAGES[413] : defaultMessage;
    }

    try {
      const data = JSON.parse(text) as Record<string, unknown>;

      if (isPayloadTooLargePayload(data, res.status)) {
        return STATUS_MESSAGES[413];
      }

      const nestedError = messageFromUnknownErrorField(data.error);
      if (nestedError) {
        if (/Request Entity Too Large|too large|PAYLOAD_TOO_LARGE/i.test(nestedError)) {
          return STATUS_MESSAGES[413];
        }
        return nestedError;
      }

      if (typeof data.message === "string" && data.message.trim()) {
        const message = data.message.trim();
        if (/Request Entity Too Large|too large|PAYLOAD_TOO_LARGE/i.test(message)) {
          return STATUS_MESSAGES[413];
        }
        return message;
      }

      if (typeof data.errorCode === "string" && /PAYLOAD_TOO_LARGE/i.test(data.errorCode)) {
        return STATUS_MESSAGES[413];
      }

      const detailsMessage = messageFromDetails(data.details);
      if (detailsMessage) return detailsMessage;
    } catch {
      if (/Request Entity Too Large|FUNCTION_PAYLOAD_TOO_LARGE|too large/i.test(text)) {
        return STATUS_MESSAGES[413];
      }
    }
  } catch {
    // Response body could not be read — use status-based fallback.
  }

  return res.status === 413 ? STATUS_MESSAGES[413] : defaultMessage;
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
