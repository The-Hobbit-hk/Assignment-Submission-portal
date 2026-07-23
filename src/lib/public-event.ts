import { prisma } from "@/lib/prisma";
import {
  fetchGoogleCalendarInstallationFeed,
  googleFeedEventId,
  syncActiveInstallationsToDb,
} from "@/lib/google-calendar-feed";
import { parseCalendarKey } from "@/lib/event-display";

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

/**
 * Resolve a public district/installation event by DB id, or by a legacy
 * Google Calendar feed id (`gcal-…` / `…@google.com`).
 */
export async function getPublicEventById(id: string) {
  const decoded = decodeURIComponent(id);

  const fromDb = await prisma.event.findFirst({
    where: {
      id: decoded,
      type: { in: ["DISTRICT", "INSTALLATION"] },
    },
    include: publicEventInclude,
  });
  if (fromDb) return fromDb;

  // Legacy calendar links used Google UIDs that were never stored as Event.id.
  if (!decoded.toLowerCase().startsWith("gcal-") && !decoded.includes("@google.com")) {
    return null;
  }

  const feed = await fetchGoogleCalendarInstallationFeed();
  const googleToDbId = await syncActiveInstallationsToDb(feed.active);

  const feedEvent =
    feed.active.find((event) => event.id === decoded) ??
    feed.active.find(
      (event) =>
        normalizeGoogleKey(event.id) === normalizeGoogleKey(decoded) ||
        normalizeGoogleKey(googleFeedEventId(decoded, decoded)) ===
          normalizeGoogleKey(event.id)
    );

  if (feedEvent) {
    const dbId = googleToDbId.get(feedEvent.id);
    if (dbId) {
      return prisma.event.findFirst({
        where: { id: dbId, type: "INSTALLATION" },
        include: publicEventInclude,
      });
    }
  }

  // Fallback: description calendar-key written during sync.
  const key = normalizeGoogleKey(decoded);
  if (!key) return null;

  const candidates = await prisma.event.findMany({
    where: {
      type: "INSTALLATION",
      description: { contains: "calendar-key:" },
    },
    include: publicEventInclude,
    take: 200,
  });

  return (
    candidates.find((event) => {
      const stored = parseCalendarKey(event.description);
      return stored ? normalizeGoogleKey(stored) === key : false;
    }) ?? null
  );
}
