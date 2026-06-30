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
