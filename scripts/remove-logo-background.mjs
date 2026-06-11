import sharp from "sharp";
import { rename, copyFile } from "node:fs/promises";
import path from "node:path";

const THRESHOLD = 48;

async function removeBlackBackground(inputPath) {
  const backupPath = inputPath.replace(/\.png$/, ".opaque-backup.png");
  await copyFile(inputPath, backupPath);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= THRESHOLD && g <= THRESHOLD && b <= THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  const tempPath = `${inputPath}.tmp.png`;
  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(tempPath);

  await rename(tempPath, inputPath);
  console.log(`Updated ${path.basename(inputPath)} (backup: ${path.basename(backupPath)})`);
}

for (const file of ["logo-rotaract-3131.png", "logo-rotaract-mark.png"]) {
  await removeBlackBackground(path.join("public", file));
}
