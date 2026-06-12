"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/api-client";

export function QueryErrorState({
  error,
  onRetry,
  title = "Unable to load data",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <div className="rounded-xl border border-destructive/25 bg-destructive/5 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-zinc-900">{title}</p>
          <p className="mt-1 text-sm text-zinc-600">{getErrorMessage(error)}</p>
          {onRetry && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4" aria-hidden />
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
