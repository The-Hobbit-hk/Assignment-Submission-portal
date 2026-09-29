const MAX_EDGE = 1920;

function imageKind(file: File): "jpeg" | "png" | "webp" | null {
  const type = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  if (type === "image/jpeg" || type === "image/jpg" || /\.jpe?g$/.test(name)) return "jpeg";
  if (type === "image/png" || name.endsWith(".png")) return "png";
  if (type === "image/webp" || name.endsWith(".webp")) return "webp";
  return null;
}

/**
 * Shrink an image in the browser before it is sent anywhere.
 * Documents are returned unchanged. The original file is kept when the result
 * is not smaller.
 */
export async function compressFileForUpload(file: File): Promise<File> {
  const kind = imageKind(file);
  if (!kind || typeof createImageBitmap !== "function") return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const mime = kind === "jpeg" ? "image/jpeg" : kind === "png" ? "image/png" : "image/webp";
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mime, kind === "png" ? undefined : 0.72);
    });
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name, { type: mime, lastModified: file.lastModified });
  } catch {
    return file;
  }
}
