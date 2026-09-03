/**
 * Live club-installation feed sourced from a Google Calendar.
 *
 * Set GOOGLE_CALENDAR_ICS_URL to the calendar's *secret* iCal address
 * (Google Calendar → Settings → the calendar → "Secret address in iCal format").
 * Any event on that calendar whose title contains the filter keyword
 * (default: "installation") is picked up automatically and shown on /calendar.
 *
 * Installations marked STATUS:CANCELLED in Google Calendar are omitted from the
 * public feed and matching DB rows are marked CANCELLED on sync.
 *
 * This is intentionally read-only and resilient: any fetch/parse failure
 * returns an empty feed so the public calendar always falls back to the DB.
 */
import ical from "node-ical";
import {
  calendarEventDedupKey,
  calendarEventTitleKey,
} from "@/lib/calendar-event-dedup";
import { prisma } from "@/lib/prisma";
import { rotaryYearStart } from "@/lib/rotary-year";

/** Public shape matching the DB events consumed by the calendar page. */
export type GoogleFeedEvent = {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  type: "INSTALLATION";
  status: "UPCOMING";
  registrationOpensAt: null;
  registrationClosesAt: null;
  registrationUrl: string | null;
  bannerUrl: null;
  club: null;
};

export type GoogleCalendarInstallationFeed = {
  active: GoogleFeedEvent[];
  cancelledKeys: string[];
};

/**
 * Titles that contain the include keyword but are NOT public club installations
 * (district/council-level ceremonies, the DRR's personal club-visit log, planning
 * meetings, multi-district events). Matched case-insensitively as substrings.
 * Override/extend with the GOOGLE_CALENDAR_EXCLUDE env var (comma-separated).
 */
const DEFAULT_EXCLUDE_KEYWORDS = [
  "council",
  "district assembly",
  "drr drishti",
  "dg and",
  "dg &",
  "mdio",
  "meeting",
  // Manually removed from public calendar — do not re-import from Google.
  "aurelis",
  "kalyaninagar",
  "kalyani nagar",
];

function excludeKeywords(): string[] {
  const raw = process.env.GOOGLE_CALENDAR_EXCLUDE;
  if (!raw) return DEFAULT_EXCLUDE_KEYWORDS;
  return raw
    .split(",")
    .map((word) => word.toLowerCase().trim())
    .filter(Boolean);
}

function clean(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function isCancelledStatus(value: unknown): boolean {
  const status = String(value ?? "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return status === "CANCELLED" || status === "CANCELED";
}

function titleLooksCancelled(title: string): boolean {
  return /\bcancell?ed\b/i.test(title) || /\[cancell?ed\]/i.test(title);
}

function matchesInstallationFilters(title: string, keyword: string, excludes: string[]) {
  const lowerTitle = title.toLowerCase();
  if (keyword && !lowerTitle.includes(keyword)) return false;
  if (excludes.some((word) => lowerTitle.includes(word))) return false;
  return true;
}

export async function fetchGoogleCalendarInstallationFeed(): Promise<GoogleCalendarInstallationFeed> {
  const url = process.env.GOOGLE_CALENDAR_ICS_URL?.trim();
  if (!url) return { active: [], cancelledKeys: [] };

  const keyword = (process.env.GOOGLE_CALENDAR_FILTER ?? "installation")
    .toLowerCase()
    .trim();
  const excludes = excludeKeywords();

  try {
    // Caching is owned by the surrounding unstable_cache wrapper; do not pass
    // an explicit `cache`/`revalidate` here (Next.js forbids `no-store` inside
    // unstable_cache and it breaks the production build).
    const res = await fetch(url, {
      headers: { "User-Agent": "rotaract-district-3131-calendar" },
    });
    if (!res.ok) {
      console.error(`Google Calendar feed responded ${res.status}`);
      return { active: [], cancelledKeys: [] };
    }

    const text = await res.text();
    const parsed = ical.sync.parseICS(text);
    const yearStart = rotaryYearStart();
    const active: GoogleFeedEvent[] = [];
    const cancelledKeys: string[] = [];

    for (const key of Object.keys(parsed)) {
      const component = parsed[key];
      if (!component || component.type !== "VEVENT") continue;

      const title = clean(component.summary);
      if (!title) continue;
      if (!matchesInstallationFilters(title, keyword, excludes)) continue;

      const start = component.start ? new Date(component.start) : null;
      if (!start || Number.isNaN(start.getTime()) || start < yearStart) continue;

      if (isCancelledStatus(component.status) || titleLooksCancelled(title)) {
        cancelledKeys.push(calendarEventDedupKey(title, start));
        continue;
      }

      const end = component.end ? new Date(component.end) : null;

      active.push({
        id: googleFeedEventId(clean(component.uid), key),
        title,
        description: clean(component.description),
        startDate: start,
        endDate: end && !Number.isNaN(end.getTime()) ? end : null,
        location: clean(component.location),
        type: "INSTALLATION",
        status: "UPCOMING",
        registrationOpensAt: null,
        registrationClosesAt: null,
        registrationUrl: clean(component.url),
        bannerUrl: null,
        club: null,
      });
    }

    return { active, cancelledKeys };
  } catch (error) {
    console.error("Google Calendar feed fetch failed", error);
    return { active: [], cancelledKeys: [] };
  }
}

/** Mark DB installation rows that Google Calendar has cancelled. */
export async function syncCancelledInstallationsToDb(cancelledKeys: string[]) {
  if (cancelledKeys.length === 0) return;

  const cancelled = new Set(cancelledKeys);
  const cancelledTitles = new Set(
    cancelledKeys.map((key) => key.split("|")[0]).filter(Boolean)
  );

  try {
    const installations = await prisma.event.findMany({
      where: {
        type: "INSTALLATION",
        status: { not: "CANCELLED" },
        startDate: { gte: rotaryYearStart() },
      },
      select: { id: true, title: true, startDate: true },
    });

    const ids = installations
      .filter((event) => {
        const dayKey = calendarEventDedupKey(event.title, event.startDate);
        if (cancelled.has(dayKey)) return true;
        return cancelledTitles.has(calendarEventTitleKey(event.title));
      })
      .map((event) => event.id);

    if (ids.length === 0) return;

    await prisma.event.updateMany({
      where: { id: { in: ids } },
      data: { status: "CANCELLED" },
    });
  } catch (error) {
    console.error("Failed to sync cancelled installations to DB", error);
  }
}

/**
 * Google often deletes cancelled events from the ICS feed instead of leaving
 * STATUS:CANCELLED. Mark previously synced Google rows that vanished as cancelled.
 */
export async function syncStaleGoogleInstallationsToDb(activeFeed: GoogleFeedEvent[]) {
  try {
    const activeIds = new Set(
      activeFeed.map((event) => event.id.replace(/^gcal-/i, "").trim()).filter(Boolean)
    );
    const activeTitles = new Set(
      activeFeed.map((event) => calendarEventTitleKey(event.title))
    );

    const googleSynced = await prisma.event.findMany({
      where: {
        type: "INSTALLATION",
        status: { not: "CANCELLED" },
        startDate: { gte: rotaryYearStart() },
        description: { contains: "calendar-key:" },
      },
      select: { id: true, title: true, description: true },
    });

    const ids = googleSynced
      .filter((event) => {
        const key = event.description?.match(/calendar-key:([^\s]+)/i)?.[1]?.trim();
        if (key && activeIds.has(key)) return false;
        if (activeTitles.has(calendarEventTitleKey(event.title))) return false;
        return true;
      })
      .map((event) => event.id);

    if (ids.length === 0) return;

    await prisma.event.updateMany({
      where: { id: { in: ids } },
      data: { status: "CANCELLED" },
    });
  } catch (error) {
    console.error("Failed to sync stale Google installations to DB", error);
  }
}

/**
 * Sync Google Calendar installations into the DB:
 * - update matching rows (by title+day, then title)
 * - create rows for installations that only exist in Google
 *
 * Returns a map of Google feed id → DB event id so calendar links use real IDs.
 */
export async function syncActiveInstallationsToDb(
  activeFeed: GoogleFeedEvent[]
): Promise<Map<string, string>> {
  const googleToDbId = new Map<string, string>();
  if (activeFeed.length === 0) return googleToDbId;

  try {
    const installations = await prisma.event.findMany({
      where: {
        type: "INSTALLATION",
        status: { not: "CANCELLED" },
        startDate: { gte: rotaryYearStart() },
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        location: true,
        registrationUrl: true,
        description: true,
      },
    });

    const dbByDay = new Map<string, (typeof installations)[number]>();
    const dbByTitle = new Map<string, (typeof installations)[number]>();
    for (const event of installations) {
      dbByDay.set(calendarEventDedupKey(event.title, event.startDate), event);
      const titleKey = calendarEventTitleKey(event.title);
      if (!dbByTitle.has(titleKey)) dbByTitle.set(titleKey, event);
    }

    const matchedDbIds = new Set<string>();
    const writes: Promise<unknown>[] = [];

    for (const feedEvent of activeFeed) {
      const dayKey = calendarEventDedupKey(feedEvent.title, feedEvent.startDate);
      const titleKey = calendarEventTitleKey(feedEvent.title);

      let dbEvent = dbByDay.get(dayKey);
      if (dbEvent && matchedDbIds.has(dbEvent.id)) dbEvent = undefined;
      if (!dbEvent) {
        const byTitle = dbByTitle.get(titleKey);
        if (byTitle && !matchedDbIds.has(byTitle.id)) dbEvent = byTitle;
      }

      if (dbEvent) {
        matchedDbIds.add(dbEvent.id);
        googleToDbId.set(feedEvent.id, dbEvent.id);

        const nextLocation =
          (feedEvent.location || "").trim() || dbEvent.location || null;
        const nextUrl =
          (feedEvent.registrationUrl || "").trim() ||
          dbEvent.registrationUrl ||
          null;
        const nextDescription = withGoogleCalendarKey(
          (feedEvent.description || "").trim() || dbEvent.description,
          feedEvent.id
        );

        const needsUpdate =
          dbEvent.startDate.getTime() !== feedEvent.startDate.getTime() ||
          (dbEvent.endDate?.getTime() ?? null) !==
            (feedEvent.endDate?.getTime() ?? null) ||
          (dbEvent.location || "").trim() !== (nextLocation || "").trim() ||
          (dbEvent.registrationUrl || "").trim() !== (nextUrl || "").trim() ||
          (dbEvent.description || "").trim() !== (nextDescription || "").trim();

        if (needsUpdate) {
          writes.push(
            prisma.event.update({
              where: { id: dbEvent.id },
              data: {
                startDate: feedEvent.startDate,
                endDate: feedEvent.endDate,
                location: nextLocation,
                registrationUrl: nextUrl,
                description: nextDescription,
              },
            })
          );
        }
        continue;
      }

      // Create Google-only installations in parallel (batched below).
      writes.push(
        prisma.event
          .create({
            data: {
              title: feedEvent.title,
              description: withGoogleCalendarKey(
                feedEvent.description,
                feedEvent.id
              ),
              startDate: feedEvent.startDate,
              endDate: feedEvent.endDate,
              location: feedEvent.location,
              registrationUrl: feedEvent.registrationUrl,
              type: "INSTALLATION",
              status: "UPCOMING",
            },
            select: { id: true },
          })
          .then((created) => {
            googleToDbId.set(feedEvent.id, created.id);
            matchedDbIds.add(created.id);
          })
      );
    }

    if (writes.length > 0) {
      await Promise.all(writes);
    }
  } catch (error) {
    console.error("Failed to sync active installations to DB", error);
  }

  return googleToDbId;
}

function withGoogleCalendarKey(description: string | null, googleFeedId: string) {
  const key = googleFeedId.replace(/^gcal-/i, "").trim();
  const cleaned = (description || "")
    .replace(/calendar-key:[^\s]+/g, "")
    .trim();
  if (!key) return cleaned || null;
  return cleaned ? `${cleaned}\n\ncalendar-key:${key}` : `calendar-key:${key}`;
}

/** Stable URL-safe id (Google UIDs contain `@` which breaks /events/[id] links). */
export function googleFeedEventId(uid: string | null, fallbackKey: string) {
  const raw = (uid || fallbackKey).trim();
  const safe = raw.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return `gcal-${safe || fallbackKey}`;
}

export async function fetchGoogleCalendarInstallations(): Promise<GoogleFeedEvent[]> {
  const feed = await fetchGoogleCalendarInstallationFeed();
  await syncCancelledInstallationsToDb(feed.cancelledKeys);
  await syncActiveInstallationsToDb(feed.active);
  await syncStaleGoogleInstallationsToDb(feed.active);
  return feed.active;
}
