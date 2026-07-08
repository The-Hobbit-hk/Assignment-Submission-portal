/**
 * Import council headshots from Cursor assets into public/council/ and
 * update photo paths in council-roster-data.ts.
 *
 *   npm run db:import-council-photos
 */
import fs from "fs";
import path from "path";
import { COUNCIL_USERS } from "../src/lib/council-roster-data";
import { councilDisplayName } from "../src/lib/council-display";

const ASSETS_DIR = path.join(
  process.env.USERPROFILE ?? "",
  ".cursor",
  "projects",
  "c-Users-Hobbit-Downloads-joineazy-dashboard",
  "assets"
);
const OUT_DIR = path.join(process.cwd(), "public", "council");
const ROSTER_FILE = path.join(process.cwd(), "src", "lib", "council-roster-data.ts");

/** Explicit filename fragment → roster email (handles typos / abbreviations). */
const MANUAL_MAP: Record<string, string> = {
  salvin: "salvinpadvi17@gmail.com",
  dev_singh: "devsharan52@gmail.com",
  travel_lad: "digvijayguddu@gmail.com",
  adhishree_t: "adhishree1997@gmail.com",
  rtr_drashlesha: "rtr.drashlesha3131@gmail.com",
  rtrpriya_bhagwani: "rtrpriyabhagwani@gmail.com",
  omkar_patil: "omkarspatil0608@gmail.com",
  hamid_shaikh: "rtn.rtr.hamids@gmail.com",
  rtr_disha: "rtrdishadaga@gmail.com",
  rohit_kumbhar: "rohitkumbhar98@gmail.com",
  sattyajeet_karale_patil: "sattyajeet.rotaract@gmail.com",
  prajwal: "prajwalrbande@gmail.com",
  jayesh: "rtrjayeshchavan@gmail.com",
  prem: "prembansode.7172@gmail.com",
  vaishnavi: "rtr.vaishnavikedari@gmail.com",
  pratham: "prathampokharkar10@gmail.com",
  vedant_chaudhary: "vedantpchaudhari41@gmail.com",
  vedant_chaudhari: "vedantpchaudhari41@gmail.com",
  disja: "rtrdishadaga@gmail.com",
  shreyash: "rtrshreyaspathak@gmail.com",
  samrudhhi: "samrudhikhade26@gmail.com",
  shriraj: "sikowitzclicks@gmail.com",
  chinmaye: "chinmayee.bartakke14@gmail.com",
  abhsihek: "rtr.abhishekdixit@gmail.com",
  harshvardhan: "rtr.harshvardhan3131@gmail.com",
  aishwarya_patil: "rtr.dr.aishwaryapatil@gmail.com",
  ashlesha: "rtr.drashlesha3131@gmail.com",
  ameya: "ameya.rotaract@gmail.com",
  madhu: "rtrmadhupimprikar@gmail.com",
};

const SKIP_FRAGMENTS = [
  "ths_group",
  "vageesh_baheti",
  "bhushan_parkhi",
  "sushant_chavan",
  "aruna_suresh",
];

function slugFromName(name: string): string {
  return councilDisplayName(name)
    .replace(/^Rtr\.\s*/i, "")
    .replace(/^Dr\.\s*/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/^(phf\.|rtr\.|dr\.|dzr\.|drs\.)\s*/gi, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function extractNameFromFilename(filename: string): string | null {
  const dashed = filename.match(/_-_([^-]+(?:-[^-]+)?)-[0-9a-f]{8}-/i);
  if (dashed) return dashed[1].replace(/_/g, " ").trim();

  // Renamed uploads: ..._images_Firstname-uuid.png
  const simple = filename.match(/_images_([^-]+)-[0-9a-f]{8}-/i);
  if (simple) return simple[1].replace(/_/g, " ").trim();

  return null;
}

function findRosterEmail(nameFragment: string): string | null {
  const key = normalizeKey(nameFragment);

  for (const [fragment, email] of Object.entries(MANUAL_MAP)) {
    if (key.includes(fragment) || fragment.includes(key)) return email;
  }

  for (const skip of SKIP_FRAGMENTS) {
    if (key.includes(skip)) return null;
  }

  for (const user of COUNCIL_USERS) {
    const display = normalizeKey(councilDisplayName(user.name));
    const parts = display.split("_").filter(Boolean);
    const first = parts[0] ?? "";
    const last = parts[parts.length - 1] ?? "";

    if (key === display) return user.email;
    if (key.includes(first) && key.includes(last)) return user.email;
    if (key === first || key === last) {
      const matches = COUNCIL_USERS.filter((u) => {
        const d = normalizeKey(councilDisplayName(u.name));
        return d.includes(key);
      });
      if (matches.length === 1) return matches[0]!.email;
    }
  }

  return null;
}

function resolveAssetsDir(): string {
  if (fs.existsSync(ASSETS_DIR)) return ASSETS_DIR;
  const alt = path.join(process.cwd(), "assets");
  if (fs.existsSync(alt)) return alt;
  throw new Error(`Assets folder not found. Tried:\n  ${ASSETS_DIR}\n  ${alt}`);
}

function main() {
  const assetsDir = resolveAssetsDir();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs
    .readdirSync(assetsDir)
    .filter((f) => f.endsWith(".png") && f.includes("_images_"));

  const emailToPhoto = new Map<string, { src: string; dest: string }>();
  const unmatched: string[] = [];
  const skipped: string[] = [];

  for (const file of files) {
    const fragment = extractNameFromFilename(file);
    if (!fragment) continue;

    const key = normalizeKey(fragment);
    if (SKIP_FRAGMENTS.some((s) => key.includes(s))) {
      skipped.push(fragment);
      continue;
    }

    const email = findRosterEmail(fragment);
    if (!email) {
      unmatched.push(`${fragment} (${file.slice(0, 80)}…)`);
      continue;
    }

    const user = COUNCIL_USERS.find((u) => u.email === email);
    if (!user) continue;

    const slug = slugFromName(user.name);
    const dest = path.join(OUT_DIR, `${slug}.png`);
    const src = path.join(assetsDir, file);

    const existing = emailToPhoto.get(email);
    if (existing) {
      // Prefer renamed short filenames and full-length portraits over older crops.
      const preferNew =
        file.includes("IMG_7602") ||
        (file.includes("Karishma") && !existing.src.includes("IMG_7602")) ||
        /_images_[A-Za-z]+-[0-9a-f]{8}-/i.test(file);
      if (!preferNew) continue;
    }

    emailToPhoto.set(email, { src, dest });
  }

  let copied = 0;
  for (const [email, { src, dest }] of emailToPhoto) {
    fs.copyFileSync(src, dest);
    copied++;
    console.log(`✓ ${path.basename(dest)} ← ${path.basename(src)}`);
  }

  let roster = fs.readFileSync(ROSTER_FILE, "utf8");

  for (const user of COUNCIL_USERS) {
    const photo = emailToPhoto.get(user.email);
    const slug = slugFromName(user.name);
    const photoPath = `/council/${slug}.png`;
    const hasFile = photo || fs.existsSync(path.join(OUT_DIR, `${slug}.png`));

    if (!hasFile) continue;

    const emailEsc = user.email.replace(/\./g, "\\.");
    const linePattern = new RegExp(
      `(\\{ name: "${user.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}", email: "${emailEsc}"[^}]*)(\\})`,
      "s"
    );

    roster = roster.replace(linePattern, (full, before, close) => {
      if (before.includes("photo:")) {
        return full.replace(/photo: "[^"]*"/, `photo: "${photoPath}"`);
      }
      const insertAt = before.lastIndexOf("role:");
      if (insertAt === -1) return full;
      const prefix = before.slice(0, insertAt);
      const suffix = before.slice(insertAt);
      return `${prefix}photo: "${photoPath}", ${suffix}${close}`;
    });
  }

  fs.writeFileSync(ROSTER_FILE, roster);

  const withPhotos = COUNCIL_USERS.filter((u) => {
    const slug = slugFromName(u.name);
    return fs.existsSync(path.join(OUT_DIR, `${slug}.png`));
  });

  const missing = COUNCIL_USERS.filter((u) => {
    const slug = slugFromName(u.name);
    return !fs.existsSync(path.join(OUT_DIR, `${slug}.png`));
  });

  console.log(`\nCopied ${copied} photos to public/council/`);
  console.log(`Council members with photos: ${withPhotos.length}/${COUNCIL_USERS.length}`);

  if (missing.length) {
    console.log("\nStill missing photos for:");
    for (const u of missing) {
      console.log(`  - ${councilDisplayName(u.name)} (${u.title})`);
    }
  }

  if (unmatched.length) {
    console.log("\nUploaded files not matched to roster:");
    for (const u of [...new Set(unmatched)]) console.log(`  - ${u}`);
  }

  if (skipped.length) {
    console.log("\nSkipped (not council members):");
    for (const s of [...new Set(skipped)]) console.log(`  - ${s}`);
  }
}

main();
