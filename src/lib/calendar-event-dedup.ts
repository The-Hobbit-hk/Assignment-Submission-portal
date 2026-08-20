import { istDateKey } from "@/lib/timezone";

/**
 * Normalize installation titles for matching across DB and Google Calendar.
 * Strips common "installation" prefixes and collapses spacing so
 * "Pune Kalyaninagar" and "Pune Kalyani Nagar" share a key.
 */
export function calendarEventTitleKey(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/^(the\s+)?(club\s+)?installation\s+/g, "")
    .replace(/\s+/g, "")
    .trim();
}

/** Normalize title + IST calendar day so DB and Google Calendar de-duplicate reliably. */
export function calendarEventDedupKey(title: string, startDate: Date) {
  return `${calendarEventTitleKey(title)}|${istDateKey(startDate)}`;
}
