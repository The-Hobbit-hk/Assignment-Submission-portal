/**
 * When true, Blue Book and monthly reporting submission windows stay open.
 * Defaults to open for testing — set BYPASS_SUBMISSION_WINDOWS=false to enforce deadlines.
 */
export function isSubmissionWindowsBypassEnabled() {
  const v = process.env.BYPASS_SUBMISSION_WINDOWS?.trim().toLowerCase();
  if (v === "false" || v === "0" || v === "no") return false;
  if (v === "true" || v === "1" || v === "yes") return true;
  return true;
}
