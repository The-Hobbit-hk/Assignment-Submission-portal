/**
 * District dues — members confirmed paid per club.
 * Add more clubs as lists arrive; then run: npm run db:mark-dues-paid
 */

export type ClubDuesPaidList = {
  /** Official club name (or unique substring). */
  clubName: string;
  /** RI / district charter id when known — preferred for matching. */
  clubCharterId?: string;
  members: string[];
};

export const DUES_PAID_LISTS: ClubDuesPaidList[] = [
  {
    clubName: "Rotaract Club of Aundh",
    clubCharterId: "91876",
    members: [
      "Omkar Gaikwad",
      "Liza Goyal",
      "Onkar Wagh",
      "Shivam Jayhind Mahabare",
      "Soham Sanjay Athavale",
      "Karan Agnani",
      "Soumitra Bhosale",
      "Akanksha Popat",
      "Arundhati Jadhav",
      "Riddhi Tanwar",
      "Trunal Chavan",
      "Ratanshi Puri",
      "Rounaak Shrivastava",
      "Kaustubh Kakade",
      "Jui Rahul Karkhele",
    ],
  },
];

/** Normalize person names for dues matching. */
export function normalizePersonName(name: string) {
  return name
    .toLowerCase()
    .replace(/^(phf\.|rtr\.|dr\.|adv\.|rtn\.)\s*/gi, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function memberDisplayName(firstName: string, lastName: string) {
  return normalizePersonName(`${firstName} ${lastName}`);
}

function tokensInOrder(needle: string[], haystack: string[]) {
  let from = 0;
  for (const token of needle) {
    const idx = haystack.indexOf(token, from);
    if (idx === -1) return false;
    from = idx + 1;
  }
  return true;
}

/** Tiny edit-distance for common spelling variants (Rounaak / Rounak). */
function almostEqual(a: string, b: string) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;
  if (longer.includes(shorter) && longer.length - shorter.length <= 2) return true;

  let mismatches = 0;
  let i = 0;
  let j = 0;
  while (i < longer.length && j < shorter.length) {
    if (longer[i] === shorter[j]) {
      i += 1;
      j += 1;
      continue;
    }
    mismatches += 1;
    if (mismatches > 2) return false;
    if (longer.length > shorter.length) i += 1;
    else if (shorter.length > longer.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  mismatches += longer.length - i + (shorter.length - j);
  return mismatches <= 2;
}

/**
 * True when the paid-list name matches a roster member.
 * Allows middle-name differences when all paid tokens appear in order.
 */
export function namesMatch(paidName: string, firstName: string, lastName: string) {
  const paid = normalizePersonName(paidName);
  const full = memberDisplayName(firstName, lastName);
  if (!paid || !full) return false;
  if (paid === full) return true;

  const paidTokens = paid.split(" ").filter(Boolean);
  const fullTokens = full.split(" ").filter(Boolean);
  if (paidTokens.length === 0 || fullTokens.length === 0) return false;

  // Exact token multiset match (order-insensitive).
  if (
    paidTokens.length === fullTokens.length &&
    [...paidTokens].sort().join("|") === [...fullTokens].sort().join("|")
  ) {
    return true;
  }

  if (tokensInOrder(paidTokens, fullTokens)) return true;
  if (paidTokens.every((token) => fullTokens.includes(token))) return true;

  // First + last token match when member has middle name(s).
  if (paidTokens.length >= 2 && fullTokens.length >= 2) {
    const paidFirst = paidTokens[0];
    const paidLast = paidTokens[paidTokens.length - 1];
    const fullFirst = fullTokens[0];
    const fullLast = fullTokens[fullTokens.length - 1];
    if (paidFirst === fullFirst && paidLast === fullLast) return true;
    if (almostEqual(paidFirst, fullFirst) && almostEqual(paidLast, fullLast)) return true;
  }

  return false;
}
