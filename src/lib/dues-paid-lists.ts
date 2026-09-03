/**
 * District dues — members confirmed paid per club.
 * Add more clubs as lists arrive; then run: npm run db:mark-dues-paid
 */

export type DuesPaidMemberEntry =
  | string
  | {
      name: string;
      riId?: string;
    };

export type ClubDuesPaidList = {
  /** Official club name (or unique substring). */
  clubName: string;
  /** RI / district charter id when known — preferred for matching. */
  clubCharterId?: string;
  members: DuesPaidMemberEntry[];
};

export function duesPaidEntryName(entry: DuesPaidMemberEntry) {
  return typeof entry === "string" ? entry : entry.name;
}

export function duesPaidEntryRiId(entry: DuesPaidMemberEntry) {
  return typeof entry === "string" ? undefined : entry.riId?.trim() || undefined;
}

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
  {
    clubName: "Rotaract Club of Sinhgad College of Pharmacy",
    clubCharterId: "8826281",
    members: [
      { name: "Arya Chavan", riId: "12367548" },
      { name: "Amruta Potdukhe", riId: "12366808" },
      { name: "Chaitrali Dave", riId: "12380216" },
      { name: "Prerna Bhilare", riId: "12022291" },
      { name: "Pragama Magotra", riId: "11996355" },
      { name: "Rajadnya Khandale", riId: "12609782" },
      { name: "Sushant Chavan", riId: "12374782" },
      { name: "Prayag Pokale", riId: "12143166" },
      { name: "Ameet Bhosale", riId: "12385238" },
      { name: "Yogiraj Aspingekar", riId: "12434377" },
      { name: "Shubham Pawar" },
      { name: "Geeta Wagh", riId: "12698868" },
      { name: "Aditi Gandhi", riId: "12345797" },
      { name: "Anushka Choudhari", riId: "12378801" },
      { name: "Dhanashri Choudhari", riId: "12374720" },
    ],
  },
  {
    clubName: "Rotaract Club of Pune Warje",
    clubCharterId: "91641",
    members: [
      { name: "Manas Jade", riId: "11943151" },
      { name: "Aditya Nimbalkar", riId: "12353538" },
      { name: "Rudra Ombase", riId: "12639359" },
      { name: "Sharvindu Jogdand", riId: "11207152" },
      { name: "Sudarshan Kolhe", riId: "12429964" },
      { name: "Aayushii Bhosaley", riId: "12407102" },
      { name: "Anshul Admane", riId: "12632229" },
      { name: "Mmahek Dudhediya", riId: "12633115" },
      { name: "Komal Naik", riId: "12633110" },
      { name: "Pranali Dhanve", riId: "12489166" },
      { name: "Rohan Bind", riId: "11683316" },
      { name: "Atharva Upasani", riId: "12643020" },
      { name: "Sanika Thete", riId: "12664446" },
      { name: "Devang Ingale", riId: "11565927" },
      { name: "Prem Satav", riId: "12633035" },
    ],
  },
  {
    clubName: "Rotaract Club of Pune Mideast",
    clubCharterId: "85530",
    members: [
      { name: "Anushka Sapatnekar", riId: "11501360" },
      { name: "Jay Bhujbal", riId: "12221604" },
      { name: "Vanshita Vaidya", riId: "12252460" },
      { name: "Shreyas Pathak", riId: "11007467" },
      { name: "Sai Awadhani", riId: "11863047" },
      { name: "Akshay Tangade", riId: "11311264" },
      { name: "Nitish Deshpande", riId: "12157571" },
      { name: "Shrinidhi Sankh", riId: "12052994" },
      { name: "Rohan Kokil", riId: "11547959" },
      { name: "Bhakti Makhwana", riId: "12384578" },
      { name: "Rujuta Khare", riId: "12706139" },
      { name: "Anushree Junnarkar", riId: "12391903" },
      { name: "Pranav Mode", riId: "11963146" },
      { name: "Saloni Deshmukh", riId: "11524084" },
      { name: "Unnati Kshatriya", riId: "12511353" },
      { name: "Darpan Jadhav", riId: "10428496" },
      { name: "Sharwari Bhagwat", riId: "12182266" },
      { name: "Arjun Gokhale", riId: "11895155" },
      { name: "Vedant Kherud", riId: "11524677" },
      { name: "Prateek Hanchate", riId: "11853942" },
      { name: "Aayush Sunil Bobade", riId: "12545712" },
      { name: "Vaishnavi Elekar", riId: "12726066" },
      { name: "Pratik Mundada", riId: "11545768" },
      { name: "Sahil Khedekar", riId: "12560197" },
    ],
  },
  {
    clubName: "Rotaract Club of Magarpatta TrendSetters",
    clubCharterId: "8824104",
    members: [
      { name: "Dharshani Satyanarayan", riId: "12271527" },
      { name: "Tashu Dhote", riId: "12271434" },
      { name: "Tanaya Deshpande", riId: "12276734" },
      { name: "Pranav Shikarkhane", riId: "12640492" },
      { name: "Karan Varghese", riId: "11974019" },
      { name: "Ayush Bhoj", riId: "12026594" },
      { name: "Ketan Khatavkar", riId: "12269587" },
      { name: "Advait Sathe", riId: "12269584" },
      { name: "Riya Inamdar", riId: "12303699" },
      { name: "Payas Pawar", riId: "12640802" },
      { name: "Omkar Bagul", riId: "12640131" },
      { name: "Shaunak Deshmukh", riId: "12647312" },
      { name: "Vaishnavi Bhosale", riId: "12640926" },
      { name: "Silky Bhore", riId: "12641146" },
      { name: "Niilee Bafna", riId: "12544887" },
      { name: "Rehan Shaikh", riId: "12671597" },
      { name: "Vageesha Karhadkar", riId: "12270852" },
      { name: "Shriya Kandge", riId: "12640485" },
      { name: "Umar Shaikh", riId: "12673727" },
      { name: "Prasad Waghulde", riId: "12684533" },
      { name: "Deetya Bunnan", riId: "12690295" },
      { name: "Niyati Jagtap", riId: "12670164" },
      { name: "Bhavani Krishnan", riId: "12683205" },
    ],
  },
  {
    clubName: "Rotaract Club of Sancheti Healthcare Academy",
    clubCharterId: "8825271",
    members: [
      { name: "Vaishnavi Katgube", riId: "12514100" },
      { name: "Aditi Jagtap", riId: "12514086" },
      { name: "Bhumika Arolkar", riId: "12514111" },
      { name: "Sarth Gotarne", riId: "12726359" },
      { name: "Sanishka Shetty", riId: "12514061" },
      { name: "Harshu Jaswal", riId: "12726360" },
      { name: "Shravani Kamble", riId: "12726363" },
      { name: "Jiya Parakh", riId: "12726365" },
      { name: "Rutuja Kale", riId: "12726368" },
      { name: "Siddhi Kasture", riId: "12726373" },
      { name: "Aarya Mapari", riId: "12514115" },
      { name: "Tanaya Patil", riId: "12514080" },
      { name: "Palak Galani", riId: "12726372" },
      { name: "Sanjana Sontakke", riId: "12726370" },
      { name: "Saie Mahesh Pawar", riId: "12726366" },
    ],
  },
  {
    clubName: "Rotaract Club of Daund College",
    clubCharterId: "215158",
    members: [
      { name: "Kartiki Palsande", riId: "12491801" },
      { name: "Dheeraj Shasam", riId: "12380247" },
      { name: "Shyam Pawar", riId: "10310079" },
      { name: "Pornima Mane", riId: "10551261" },
      { name: "Pooja Bidgar", riId: "10555463" },
      { name: "Trushna Thorat", riId: "12380244" },
      { name: "Akash Shinde", riId: "10767167" },
      { name: "Hrutukesh Hanchate", riId: "12097073" },
      { name: "Varsha Mallav", riId: "12688619" },
      { name: "Sakshi Jagtap", riId: "12173797" },
      { name: "Anurag Sarode", riId: "11819149" },
      { name: "Prajwal Bande", riId: "11093273" },
      { name: "Prem Bansode", riId: "10767145" },
      { name: "Shekhar Palekar", riId: "10766500" },
      { name: "Aman Lund", riId: "10797080" },
      { name: "Vaibhav Kurhade", riId: "12380240" },
      { name: "Abhishek Wable", riId: "11476489" },
      { name: "Hemangi Bamb", riId: "10036272" },
    ],
  },
  {
    clubName: "Rotaract Club of D. Y. Patil International University",
    clubCharterId: "216012",
    members: [
      { name: "Aarohi Gadpayle", riId: "12697640" },
      { name: "Pehal Vadehra", riId: "12463579" },
      { name: "Suryansh Srivastava", riId: "12685360" },
      { name: "Bhoomi Rastogi", riId: "12685600" },
      { name: "Archi Shankar", riId: "12685313" },
      { name: "Sanjana Pillay", riId: "12441185" },
      { name: "Atharva Jamdade", riId: "12685531" },
      { name: "Aarti", riId: "12686065" },
      { name: "Swarali Ghadge", riId: "12679310" },
      { name: "Gauri Diwan", riId: "12729455" },
      { name: "Suhani Roy", riId: "12685629" },
      { name: "Siddhant Shintre", riId: "12685452" },
      { name: "Vansh Singh Dang", riId: "12463284" },
      { name: "Tanish Shinde", riId: "12463685" },
      { name: "Sushant Pachbhai", riId: "12685356" },
      { name: "Manasvi Mawal", riId: "12706873" },
      { name: "Sahil Nelge", riId: "12685593" },
      { name: "Pawani Sharma", riId: "12685833" },
      { name: "Prathamesh Ugale Patil", riId: "12685826" },
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
