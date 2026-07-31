/** District 3131 operates in Indian Standard Time. */
export const DISTRICT_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET = "+05:30";

const IST = { timeZone: DISTRICT_TIMEZONE } as const;

function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
}

/**
 * Build a Date for a wall-clock time in Asia/Kolkata.
 * `month` is 1–12 (calendar month).
 */
export function istWallTime(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0
) {
  return new Date(
    `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(ms, 3)}${IST_OFFSET}`
  );
}

/** Last calendar day of a month (1–12). */
export function lastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function formatIstDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
) {
  return date.toLocaleDateString("en-IN", { ...options, ...IST });
}

export function formatIstTime(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  }
) {
  return date.toLocaleTimeString("en-IN", { ...options, ...IST });
}

/** e.g. "31 July 2026, 11:59 pm" */
export function formatIstDateTime(date: Date) {
  return date.toLocaleString("en-IN", {
    ...IST,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** e.g. "Saturday, 8 August 2026 · 7:00 pm – 10:00 pm" */
export function formatIstDateTimeRange(start: Date, end?: Date | null) {
  const datePart = formatIstDate(start);
  const startTime = formatIstTime(start);
  if (!end) return `${datePart} · ${startTime}`;
  return `${datePart} · ${startTime} – ${formatIstTime(end)}`;
}

/** Calendar-day key in IST (avoids UTC day shifts near midnight). */
export function istDateKey(date: Date) {
  return date.toLocaleDateString("en-CA", IST); // YYYY-MM-DD
}

/** Year / month / day in Asia/Kolkata (month is 1–12). */
export function istCalendarParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    ...IST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const num = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return {
    year: num("year"),
    month: num("month"),
    day: num("day"),
  };
}
