import sharp from "sharp";

const MAX_EDGE = 1920;

type Compressed = {
  buffer: Buffer;
  contentType: string;
};

function isJpeg(contentType: string, ext: string) {
  return contentType === "image/jpeg" || ext === ".jpg" || ext === ".jpeg";
}

function isPng(contentType: string, ext: string) {
  return contentType === "image/png" || ext === ".png";
}

function isWebp(contentType: string, ext: string) {
  return contentType === "image/webp" || ext === ".webp";
}

/**
 * Shrink images before they are stored. PDFs and other documents are returned
 * unchanged. The original buffer is kept when compression does not help.
 */
export async function compressForStorage(
  input: Buffer,
  contentType: string,
  ext: string
): Promise<Compressed> {
  const type = contentType.toLowerCase();
  const extension = ext.toLowerCase();
  if (!isJpeg(type, extension) && !isPng(type, extension) && !isWebp(type, extension)) {
    return { buffer: input, contentType: contentType || "application/octet-stream" };
  }

  try {
    const pipeline = sharp(input, { failOn: "none" }).rotate();
    const meta = await pipeline.metadata();
    const edge = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (edge > MAX_EDGE) {
      pipeline.resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    let out: Buffer;
    let outType: string;
    if (isJpeg(type, extension)) {
      out = await pipeline.jpeg({ quality: 72, mozjpeg: true }).toBuffer();
      outType = "image/jpeg";
    } else if (isPng(type, extension)) {
      out = await pipeline.png({ compressionLevel: 9, effort: 8 }).toBuffer();
      outType = "image/png";
    } else {
      out = await pipeline.webp({ quality: 72 }).toBuffer();
      outType = "image/webp";
    }

    if (out.length >= input.length) {
      return { buffer: input, contentType: contentType || outType };
    }
    return { buffer: out, contentType: outType };
  } catch {
    return { buffer: input, contentType: contentType || "application/octet-stream" };
  }
}
