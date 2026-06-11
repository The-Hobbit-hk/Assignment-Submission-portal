/** Strip honorific prefixes for compact display. */
export function councilDisplayName(full: string): string {
  return full
    .replace(/^(PHF\.\s*)+/i, "")
    .replace(/^(DRR\.|PDRR\.|DRRE\.)\s*/gi, "")
    .replace(/^Adv\.\s*/i, "")
    .trim();
}

export function councilInitials(name: string): string {
  const cleaned = councilDisplayName(name)
    .replace(/^Rtr\.\s*/i, "")
    .replace(/^Dr\.\s*/i, "");

  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";

  const letters = words
    .filter((w) => !/^(Dr|PHF)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return letters || words[0][0]?.toUpperCase() || "?";
}

export function councilAvatarGradient(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [330, 280, 220, 190, 350, 260, 310];
  const h1 = hues[Math.abs(hash) % hues.length];
  const h2 = (h1 + 48) % 360;
  return `linear-gradient(155deg, hsl(${h1} 62% 32%) 0%, hsl(${h2} 55% 20%) 55%, hsl(${h1} 50% 14%) 100%)`;
}

export function councilShortClub(club: string): string {
  return club.replace(/^Rotaract Club of\s+/i, "");
}
