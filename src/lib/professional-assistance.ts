import { COUNCIL_USERS } from "@/lib/council-roster-data";

const PAO_TITLE = "District Officer - Professional Assistance";

export function isProfessionalAssistanceOfficer(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.toLowerCase();
  return COUNCIL_USERS.some(
    (user) =>
      user.email.toLowerCase() === normalized && user.title === PAO_TITLE
  );
}
