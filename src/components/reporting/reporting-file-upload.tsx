"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReportingFileUploadProps {
  label: string;
  fileUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
  accept?: string;
  hint?: string;
  /** When file is selected locally but not yet uploaded to server */
  pendingLabel?: string;
}

export function ReportingFileUpload({
  label,
  fileUrl,
  onUpload,
  onClear,
  disabled,
  className,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  hint = "PDF or image",
  pendingLabel,
}: ReportingFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isPending = fileUrl === "pending";
  const hasFile = Boolean(fileUrl && fileUrl !== "pending");

  const handleFile = async (file: File | undefined) => {
    if (!file || disabled) return;
    setError("");
    setUploading(true);
    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("mt-3 space-y-2 rounded-lg border border-border/40 bg-black/20 p-3", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>

      {hasFile ? (
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={fileUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent hover:underline"
          >
            View uploaded file
          </a>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              onClick={onClear}
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      ) : isPending && pendingLabel ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-foreground">{pendingLabel}</span>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              onClick={onClear}
            >
              <X className="h-3.5 w-3.5" />
              Remove
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="h-4 w-4" />
            )}
            {uploading ? "Uploading…" : "Choose file"}
          </Button>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
