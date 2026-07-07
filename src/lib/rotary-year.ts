/**
 * Rotary / Rotaract year helpers.
 *
 * The Rotary year runs from July 1 to June 30 of the following calendar year.
 * A Rotary year is identified by its start year (e.g. 2026 -> "2026-27").
 *
 * Everything period-related in the app is stored as a calendar (month, year)
 * pair, so the Rotary year is always *derived* from those pairs — no schema
 * changes are required.
 */

/** Month ordering within a Rotary year: July (7) through June (6). */
export const ROTARY_MONTH_ORDER = [7, 8, 9, 10, 11, 12, 1, 2, 3, 4, 5, 6] as const;

/** The Rotary year (start year) that a given calendar month/year belongs to. */
export function rotaryYearOfMonth(month: number, year: number): number {
  // Jul–Dec belong to the year that just started; Jan–Jun belong to the prior year's Rotary year.
  return month >= 7 ? year : year - 1;
}

/** Human label for a Rotary year given its start year, e.g. 2026 -> "2026-27". */
export function getRotaryYearLabel(startYear: number): string {
  const end = (startYear + 1) % 100;
  return `${startYear}-${end.toString().padStart(2, "0")}`;
}

export type RotaryYear = {
  /** First calendar year of the Rotary year (e.g. 2026). */
  startYear: number;
  /** Second calendar year of the Rotary year (e.g. 2027). */
  endYear: number;
  /** Display label, e.g. "2026-27". */
  label: string;
  /** July 1 00:00:00.000 of the start year. */
  start: Date;
  /** June 30 23:59:59.999 of the end year. */
  end: Date;
};

/** The Rotary year that contains `now` (defaults to the current date). */
export function getCurrentRotaryYear(now: Date = new Date()): RotaryYear {
  const startYear = rotaryYearOfMonth(now.getMonth() + 1, now.getFullYear());
  return getRotaryYearFromStartYear(startYear);
}

/** Build a RotaryYear from its start year. */
export function getRotaryYearFromStartYear(startYear: number): RotaryYear {
  return {
    startYear,
    endYear: startYear + 1,
    label: getRotaryYearLabel(startYear),
    start: new Date(startYear, 6, 1, 0, 0, 0, 0),
    end: new Date(startYear + 1, 5, 30, 23, 59, 59, 999),
  };
}

/** July 1 (00:00) of the current Rotary year — replacement for the old calendarYearStart(). */
export function rotaryYearStart(now: Date = new Date()): Date {
  return getCurrentRotaryYear(now).start;
}

/** The current Rotary year's label, e.g. "2026-27". */
export function getCurrentRotaryYearLabel(now: Date = new Date()): string {
  return getCurrentRotaryYear(now).label;
}

/**
 * The 12 calendar (month, year) pairs of a Rotary year, ordered Jul -> Jun.
 * Pass the Rotary year's start year (e.g. 2026).
 */
export function rotaryYearMonths(
  startYear: number
): Array<{ month: number; year: number }> {
  return ROTARY_MONTH_ORDER.map((month) => ({
    month,
    year: month >= 7 ? startYear : startYear + 1,
  }));
}

/** Rotary quarter (1-4) for a calendar month: Q1 = Jul-Sep ... Q4 = Apr-Jun. */
export function rotaryQuarterOfMonth(month: number): number {
  const index = ROTARY_MONTH_ORDER.indexOf(month as (typeof ROTARY_MONTH_ORDER)[number]);
  return Math.floor(index / 3) + 1;
}

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type RotaryMonthOption = {
  month: number;
  year: number;
  /** Stable value for a <select>, e.g. "7-2026". */
  value: string;
  /** Display label, e.g. "Jul 2026" or "July". */
  label: string;
};

/**
 * The 12 months of a Rotary year as select options, ordered Jul -> Jun.
 * `long` uses full month names; `withYear` appends the calendar year.
 */
export function rotaryMonthOptions(
  startYear: number,
  opts: { long?: boolean; withYear?: boolean } = {}
): RotaryMonthOption[] {
  const names = opts.long ? MONTH_LONG : MONTH_SHORT;
  return rotaryYearMonths(startYear).map(({ month, year }) => ({
    month,
    year,
    value: `${month}-${year}`,
    label: opts.withYear ? `${names[month - 1]} ${year}` : names[month - 1],
  }));
}
