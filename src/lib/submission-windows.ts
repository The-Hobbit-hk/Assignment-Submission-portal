/** When true, Blue Book and monthly reporting submission windows stay open (testing only). */
export function isSubmissionWindowsBypassEnabled() {
  const v = process.env.BYPASS_SUBMISSION_WINDOWS?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}
