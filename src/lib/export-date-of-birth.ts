/**
 * Export-only fake dates of birth.
 * Majority young (2004+, ages ≈18–22); a smaller share around year 2000.
 * Age always >= 18. No sequential / patterned assignment across the roster.
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

function pickInRange(rand: () => number, lo: number, hi: number) {
  const span = Math.max(0, hi - lo);
  const u = (rand() + rand() * 0.6180339887) % 1;
  return lo + Math.floor(u * (span + 1));
}

/**
 * Stable per member id (same export row each time), but looks random across the roster.
 * Returns YYYY-MM-DD.
 */
export function randomExportDateOfBirth(memberId: string, now = new Date()): string {
  // Youngest allowed: exactly 18 today
  const maxAge18 = Date.UTC(
    now.getUTCFullYear() - 18,
    now.getUTCMonth(),
    now.getUTCDate()
  );
  // Preferred young band: ages ≈18–22, not before 2004
  const age22Cutoff = Date.UTC(
    now.getUTCFullYear() - 22,
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const youngLo = Math.max(Date.UTC(2004, 0, 1), age22Cutoff);
  const youngHi = maxAge18;

  // Smaller older pocket: around 2000 (2000–2003)
  const olderLo = Date.UTC(2000, 0, 1);
  const olderHi = Math.min(Date.UTC(2003, 11, 31), maxAge18);

  const rand = mulberry32(hashSeed(`dob-export-v3:${memberId}`));
  // ~80% young (2004+ / 18–22); ~20% around 2000
  const useYoung = rand() < 0.8;
  const ms = useYoung
    ? pickInRange(rand, Math.min(youngLo, youngHi), youngHi)
    : pickInRange(rand, olderLo, Math.max(olderLo, olderHi));

  return utcYmd(new Date(ms));
}
