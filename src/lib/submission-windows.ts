/**
 * When true, Blue Book and monthly reporting submission windows stay open.
 * Defaults to CLOSED (deadlines enforced) for production — set
 * BYPASS_SUBMISSION_WINDOWS=true only to re-open everything for testing.
 */
export function isSubmissionWindowsBypassEnabled() {
  const v = process.env.BYPASS_SUBMISSION_WINDOWS?.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  return false;
}

/**
 * Accounts for which monthly reporting stays open all month long (not just the
 * 1st-10th window). Everyone else follows the normal deadline. Extendable via
 * the REPORTING_ALWAYS_OPEN_EMAILS env var (comma-separated).
 */
const REPORTING_ALWAYS_OPEN_EMAILS = new Set(
  [
    "admin@rotaract3131.org",
    "club.demo@rotaract3131.org",
    ...(process.env.REPORTING_ALWAYS_OPEN_EMAILS ?? "").split(","),
  ]
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

export function isReportingAlwaysOpenUser(email?: string | null): boolean {
  if (!email) return false;
  return REPORTING_ALWAYS_OPEN_EMAILS.has(email.trim().toLowerCase());
}
