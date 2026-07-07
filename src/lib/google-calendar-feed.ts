/**
 * Live club-installation feed sourced from a Google Calendar.
 *
 * Set GOOGLE_CALENDAR_ICS_URL to the calendar's *secret* iCal address
 * (Google Calendar → Settings → the calendar → "Secret address in iCal format").
 * Any event on that calendar whose title contains the filter keyword
 * (default: "installation") is picked up automatically and shown on /calendar.
 *
 * This is intentionally read-only and resilient: any fetch/parse failure
 * returns an empty list so the public calendar always falls back to the DB.
 */
import ical from "node-ical";

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

function calendarYearStart() {
  const yearStart = new Date();
  yearStart.setMonth(0, 1);
  yearStart.setHours(0, 0, 0, 0);
  return yearStart;
}

function clean(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export async function fetchGoogleCalendarInstallations(): Promise<GoogleFeedEvent[]> {
  const url = process.env.GOOGLE_CALENDAR_ICS_URL?.trim();
  if (!url) return [];

  const keyword = (process.env.GOOGLE_CALENDAR_FILTER ?? "installation")
    .toLowerCase()
    .trim();

  try {
    // Caching is owned by the surrounding unstable_cache wrapper; do not pass
    // an explicit `cache`/`revalidate` here (Next.js forbids `no-store` inside
    // unstable_cache and it breaks the production build).
    const res = await fetch(url, {
      headers: { "User-Agent": "rotaract-district-3131-calendar" },
    });
    if (!res.ok) {
      console.error(`Google Calendar feed responded ${res.status}`);
      return [];
    }

    const text = await res.text();
    const parsed = ical.sync.parseICS(text);
    const yearStart = calendarYearStart();
    const events: GoogleFeedEvent[] = [];

    for (const key of Object.keys(parsed)) {
      const component = parsed[key];
      if (!component || component.type !== "VEVENT") continue;

      const title = clean(component.summary);
      if (!title) continue;
      if (keyword && !title.toLowerCase().includes(keyword)) continue;

      const start = component.start ? new Date(component.start) : null;
      if (!start || Number.isNaN(start.getTime()) || start < yearStart) continue;

      const end = component.end ? new Date(component.end) : null;

      events.push({
        id: `gcal-${clean(component.uid) ?? key}`,
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

    return events;
  } catch (error) {
    console.error("Google Calendar feed fetch failed", error);
    return [];
  }
}
