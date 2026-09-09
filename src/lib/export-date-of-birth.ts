/**
 * Export-only fake dates of birth.
 * Year >= 2000, age at least 18 — no sequential / patterned assignment.
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
 * Returns YYYY-MM-DD.
 */
export function randomExportDateOfBirth(memberId: string, now = new Date()): string {
  const min = Date.UTC(2000, 0, 1);
  // Latest birthday that is still age >= 18 today
  const max = Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate());
  const span = Math.max(0, max - min);

  const rand = mulberry32(hashSeed(`dob-export:${memberId}`));
  // Mix two draws so day-of-year isn't correlated with id length / prefix
  const u = (rand() + rand() * 0.6180339887) % 1;
  const ms = min + Math.floor(u * (span + 1));
  return utcYmd(new Date(ms));
}
