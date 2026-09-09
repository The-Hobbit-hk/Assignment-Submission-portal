/**
 * Export-only fake dates of birth.
 * Biased young (mostly ages 18–22): birth year 2004+, age always >= 18.
 * No sequential / patterned assignment across the roster.
 */

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 — enough scramble that nearby seeds don't produce nearby dates. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function utcYmd(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Stable per member id (same export row each time), but looks random across the roster.
 * Returns YYYY-MM-DD in the young adult window (≈18–22).
 */
export function randomExportDateOfBirth(memberId: string, now = new Date()): string {
  // Youngest allowed: exactly 18 today
  const max = Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate());
  // Oldest in the preferred band: just turning 22 (or 2004-01-01 if that is younger)
  const age22Cutoff = Date.UTC(
    now.getUTCFullYear() - 22,
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const minPreferred = Math.max(Date.UTC(2004, 0, 1), age22Cutoff);
  // Hard floor: never before 2004
  const minFloor = Date.UTC(2004, 0, 1);
  const min = Math.min(minPreferred, max);
  const floor = Math.min(minFloor, max);

  const rand = mulberry32(hashSeed(`dob-export-v2:${memberId}`));
  // ~90% in the 18–22 / 2004+ band; small tail still 2004+ but up to the same max
  const useCore = rand() < 0.9;
  const lo = useCore ? min : floor;
  const hi = max;
  const span = Math.max(0, hi - lo);
  const u = (rand() + rand() * 0.6180339887) % 1;
  const ms = lo + Math.floor(u * (span + 1));
  return utcYmd(new Date(ms));
}
