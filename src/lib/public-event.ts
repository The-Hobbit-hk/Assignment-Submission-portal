import { unstable_cache } from "next/cache";
import { parseCalendarKey } from "@/lib/event-display";
import { prisma } from "@/lib/prisma";
import { rotaryYearStart } from "@/lib/rotary-year";

const publicEventInclude = {
  club: { select: { name: true, zone: true, city: true } },
  gallery: { orderBy: { createdAt: "asc" as const }, take: 6 },
} as const;

function normalizeGoogleKey(raw: string) {
  return raw
    .replace(/^gcal-/i, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function isLegacyGoogleId(id: string) {
  const lower = id.toLowerCase();
  return lower.startsWith("gcal-") || lower.includes("@google.com");
}

/**
 * DB-only lookup. Never fetches Google Calendar ICS here — that was burning
 * Fluid Active CPU on every /events/[id] miss (unique gcal URLs × full sync).
 * Installations are upserted when /calendar refreshes its cached feed.
 */
async function lookupPublicEventById(id: string) {
  const decoded = decodeURIComponent(id).trim();
  if (!decoded) return null;

  const fromDb = await prisma.event.findFirst({
    where: {
      id: decoded,
      type: { in: ["DISTRICT", "INSTALLATION"] },
    },
    include: publicEventInclude,
  });
  if (fromDb) return fromDb;

  if (!isLegacyGoogleId(decoded)) return null;

  const key = normalizeGoogleKey(decoded);
  if (!key) return null;

  // Prefer a narrow LIKE on the stored calendar-key rather than loading 200 rows.
  const candidates = await prisma.event.findMany({
    where: {
      type: "INSTALLATION",
      description: { contains: `calendar-key:${key}` },
    },
    include: publicEventInclude,
    take: 5,
  });

  const exact =
    candidates.find((event) => {
      const stored = parseCalendarKey(event.description);
      return stored ? normalizeGoogleKey(stored) === key : false;
    }) ?? null;

  if (exact) return exact;

  // Older keys may still contain `@` before we sanitized feed ids.
  const looseKey = key.replace(/-google-com$/i, "");
  if (!looseKey || looseKey === key) return null;

  const loose = await prisma.event.findMany({
    where: {
      type: "INSTALLATION",
      description: { contains: "calendar-key:" },
      startDate: { gte: rotaryYearStart() },
    },
    include: publicEventInclude,
    take: 80,
  });

  return (
    loose.find((event) => {
      const stored = parseCalendarKey(event.description);
      if (!stored) return false;
      const normalized = normalizeGoogleKey(stored);
      return normalized === key || normalized.startsWith(looseKey);
    }) ?? null
  );
}

const getCachedPublicEventById = unstable_cache(
  lookupPublicEventById,
  ["public-event-by-id-v2"],
  { revalidate: 600, tags: ["public-events"] }
);

export async function getPublicEventById(id: string) {
  return getCachedPublicEventById(decodeURIComponent(id).trim());
}

/** Warm ISR for known district/installation pages at build time. */
export async function listPublicEventStaticParams() {
  const events = await prisma.event.findMany({
    where: {
      type: { in: ["DISTRICT", "INSTALLATION"] },
      status: { not: "CANCELLED" },
      startDate: { gte: rotaryYearStart() },
    },
    select: { id: true },
    orderBy: { startDate: "asc" },
    take: 200,
  });
  return events.map((event) => ({ id: event.id }));
}
