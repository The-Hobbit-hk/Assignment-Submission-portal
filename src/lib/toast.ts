import { toast as sonnerToast } from "sonner";
import { getErrorMessage } from "@/lib/api-client";

export const toast = {
  success(message: string) {
    sonnerToast.success(message);
  },
  error(message: string, id?: string) {
    sonnerToast.error(message, id ? { id } : undefined);
  },
  info(message: string) {
    sonnerToast.message(message);
  },
};

export function reportError(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  const message = getErrorMessage(error, fallback);
  toast.error(message);
  return message;
}

/** Use in form catch blocks when React Query already shows a global mutation toast. */
export function formErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  return getErrorMessage(error, fallback);
}

export function notifyValidation(message: string): string {
  toast.error(message);
  return message;
}
