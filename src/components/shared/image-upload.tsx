"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formErrorMessage, toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  /** Current image URL, if any. */
  value?: string | null;
  /** Uploads the file and resolves to the stored URL. */
  onUpload: (file: File) => Promise<string | null>;
  /** Called after a successful upload with the new URL. */
  onUploaded?: (url: string | null) => void;
  shape?: "circle" | "square";
  label?: string;
  /** Rendered inside the frame when there is no image. */
  fallback?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const MAX_BYTES = 4 * 1024 * 1024;

export function ImageUpload({
  value,
  onUpload,
  onUploaded,
  shape = "square",
  label = "Upload image",
  fallback,
  className,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file: File) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Please choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be 4MB or smaller.");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);
    try {
      const url = await onUpload(file);
      setPreview(url);
      onUploaded?.(url);
      toast.success("Image updated.");
    } catch (err) {
      setPreview(value ?? null);
      toast.error(formErrorMessage(err, "Upload failed."));
    } finally {
      setIsUploading(false);
      URL.revokeObjectURL(localUrl);
    }
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || isUploading}
        className={cn(
          "group relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border border-border/60 bg-muted transition hover:border-accent",
          shape === "circle" ? "rounded-full" : "rounded-xl"
        )}
        aria-label={label}
      >
        {preview ? (
          <Image
            src={preview}
            alt=""
            fill
            sizes="96px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="text-muted-foreground">{fallback ?? <Camera className="h-6 w-6" />}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </span>
      </button>

      <div className="space-y-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
          {label}
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP · up to 4MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
