import type { ClubStatus } from "@/generated/prisma/client";

/**
 * Official Rotaract District 3131 club roster (Zones 1–7).
 * Source: Zonal Allocation RIY 2026–27.
 */

export type DistrictClubRecord = {
  name: string;
  zone: string;
  riClubId: string;
  sponsoringClub?: string;
  charterDate?: string;
  city?: string;
  status?: "ACTIVE" | "INACTIVE" | "PROVISIONAL";
};

export type DistrictZoneMeta = {
  zone: string;
  reps: string[];
  totalClubs: number;
};

export const DISTRICT_ZONE_META: DistrictZoneMeta[] = [
  { zone: "Zone 1", reps: ["Rtr. Aniket Sardar"], totalClubs: 12 },
  { zone: "Zone 2", reps: ["Rtr. Rajas Uchagaonkar", "Rtr. Sumedh Gite"], totalClubs: 13 },
  { zone: "Zone 3", reps: ["Rtr. Pratham Pokharkar", "Rtr. Sarthak Ambhore"], totalClubs: 16 },
  { zone: "Zone 4", reps: ["Rtr. Vedant Chirmade", "Rtr. Aditya Verma"], totalClubs: 13 },
  { zone: "Zone 5", reps: ["Rtr. Vedant Chaudhari", "Rtr. Prerna Bhilare"], totalClubs: 17 },
  { zone: "Zone 6", reps: ["Rtr. Tisha Sancheti", "Rtr. Rohit Kumbhar"], totalClubs: 17 },
  { zone: "Zone 7", reps: ["Rtr. Prem Bansode", "Rtr. Shrushti Shirore"], totalClubs: 14 },
];

export const DISTRICT_OFFICIAL_CLUB_COUNT = DISTRICT_ZONE_META.reduce(
  (sum, zone) => sum + zone.totalClubs,
  0
);

const Z1: Omit<DistrictClubRecord, "zone">[] = [
  { name: "Rotaract Club of Konkan Gyanpeeth Rahul Dharkar College Of Pharmacy Karjat", riClubId: "8825261", sponsoringClub: "Karjat (Rotary Club)", charterDate: "5 November 2022", city: "Karjat" },
  { name: "Rotaract Club of Khopoli", riClubId: "218693", sponsoringClub: "Khopoli (Rotary Club)", charterDate: "18 November 2020", city: "Khopoli" },
  { name: "Rotaract Club of Panvel Elite", riClubId: "217226", sponsoringClub: "Panvel Elite (Rotary Club)", charterDate: "15 July 2019", city: "Panvel" },
  { name: "Rotaract Club of Panvel Industrial Town", riClubId: "213849", sponsoringClub: "Panvel Industrial Town (Rotary Club)", charterDate: "11 May 2016", city: "Panvel" },
  { name: "Rotaract Club of Patalganga", riClubId: "217310", sponsoringClub: "Patalganga (Rotary Club)", charterDate: "2019", city: "Patalganga" },
  { name: "Rotaract Club of MGM's Institute of Management Studies and Research", riClubId: "8826014", sponsoringClub: "Panvel Symphony (Rotary Club)", charterDate: "4 February 2024", city: "Panvel" },
  { name: "Rotaract Club of Universal AI University", riClubId: "8826658", sponsoringClub: "Karjat (Rotary Club)", charterDate: "28 August 2024", city: "Karjat" },
  { name: "Rotaract Club of Pen Heritage", riClubId: "8826471", sponsoringClub: "Pen (Rotary Club)", city: "Pen" },
  { name: "Rotaract Club of New Panvel-CKT College", riClubId: "8824138", sponsoringClub: "New Panvel (Rotary Club)", city: "New Panvel" },
  { name: "Rotaract Club of Panvel Central", riClubId: "214399", sponsoringClub: "Panvel Central (Rotary Club)", city: "Panvel" },
  { name: "Rotaract Club of Alibag Seashore", riClubId: "8823837", sponsoringClub: "Alibag Seashore (Rotary Club)", charterDate: "2024", city: "Alibag" },
  { name: "Rotaract Club of C.K.T. ACS College New Panvel", riClubId: "8826363", sponsoringClub: "Panvel (Rotary Club)", city: "New Panvel" },
];

const Z2: Omit<DistrictClubRecord, "zone">[] = [
  { name: "Rotaract Club of Bharati Vidyapeeth New Law College Pune", riClubId: "8827789", sponsoringClub: "Rotary Club of Poona Midtown", city: "Pune" },
  { name: "Rotaract Club of Pimpri", riClubId: "7295", sponsoringClub: "Pimpri (Rotary Club)", charterDate: "9 August 1980", city: "Pimpri" },
  { name: "Rotaract Club of Symbiosis Skills and Professional University", riClubId: "8825207", sponsoringClub: "Poona Downtown (Rotary Club)", charterDate: "29 September 2022", city: "Pune" },
  { name: "Rotaract Club of Nigdi-Pune", riClubId: "8825815", sponsoringClub: "Nigdi-Pune (Rotary Club)", charterDate: "28 June 2023", city: "Nigdi" },
  { name: "Rotaract Club of Ajeenkya DY Patil Group", riClubId: "8826992", sponsoringClub: "Pune Amanora (Rotary Club)", charterDate: "7 February 2025", city: "Pune" },
  { name: "Rotaract Club of Ramkrishna More College", riClubId: "8824661", sponsoringClub: "Chinchwad-Pune (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Bavdhan Pioneers", riClubId: "8827103", sponsoringClub: "Hadapsar Central (Rotary Club)", charterDate: "26 March 2025", city: "Bavdhan" },
  { name: "Rotaract Club of Golden Talegaon Dabhade", riClubId: "8827547", sponsoringClub: "Talegaon Dabhade City (Rotary Club)", charterDate: "13 August 2025", city: "Talegaon Dabhade" },
  { name: "Rotaract Club of Udyognagri Drishti", riClubId: "3131-Z2-09", city: "Pune" },
  { name: "Rotaract Club of MU College of Commerce Pimpri", riClubId: "8825176", sponsoringClub: "Khadki (Rotary Club)", city: "Pimpri" },
  { name: "Rotaract Club of Disha Alandi", riClubId: "8825319", sponsoringClub: "Pune Central (Rotary Club)", city: "Alandi" },
  { name: "Rotaract Club of MIMA Institute of Management", riClubId: "8826782", sponsoringClub: "Pune Sports City (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Dr. Babasaheb Ambedkar College Aundh", riClubId: "8826851", sponsoringClub: "Aundh (Rotaract Club)", city: "Aundh" },
];

const Z3: Omit<DistrictClubRecord, "zone">[] = [
  { name: "Rotaract Club of Aundh", riClubId: "91876", sponsoringClub: "Aundh (Rotary Club)", charterDate: "12 August 2014", city: "Aundh" },
  { name: "Rotaract Club of Pimpri Elite", riClubId: "8825918", sponsoringClub: "Pimpri Elite (Rotary Club)", charterDate: "5 September 2023", city: "Pimpri" },
  { name: "Rotaract Club of D. Y. Patil International University", riClubId: "216012", sponsoringClub: "Nigdi-Pune (Rotary Club)", charterDate: "16 August 2018", city: "Pune" },
  { name: "Rotaract Club of Dr. D. Y. Patil B School", riClubId: "215185", sponsoringClub: "Pune Sports City (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Aundh Smartcity", riClubId: "8826236", sponsoringClub: "Self sponsored", city: "Aundh" },
  { name: "Rotaract Club of Government Industrial Training Institute (Male) Mulshi", riClubId: "8826699", sponsoringClub: "Pune Parvati (Rotary Club)", city: "Mulshi" },
  { name: "Rotaract Club of Daund College", riClubId: "215158", sponsoringClub: "Daund (Rotary Club)", charterDate: "5 September 2017", city: "Daund" },
  { name: "Rotaract Club of Anantrao Pawar College Pirangut", riClubId: "3131-Z3-08", sponsoringClub: "Pune Shaniwarwada", charterDate: "June 2025", city: "Pirangut" },
  { name: "Rotaract Club of Indira College", riClubId: "217518", sponsoringClub: "Pune Baner (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Rajarshi Shahu College of Engineering- Tathawade", riClubId: "215402", sponsoringClub: "Akurdi Pune (Rotary Club)", charterDate: "5 December 2017", city: "Tathawade" },
  { name: "Rotaract Club of Symbiosis Law Viman Nagar", riClubId: "217454", sponsoringClub: "Pune Kalyani Nagar (Rotary Club)", city: "Viman Nagar" },
  { name: "Rotaract Club of Humanitas", riClubId: "217388", sponsoringClub: "Pimpri Town (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Nexus", riClubId: "8825267", sponsoringClub: "ALUMNI (Rotaract Club)", status: "INACTIVE" },
  { name: "Rotaract Club of Pune Pristine", riClubId: "218320", sponsoringClub: "Pune Pristine (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Indian Institute of Education and Business Management", riClubId: "8825312", sponsoringClub: "Pune Baner (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of S. B. Patil College of Architecture and Design", riClubId: "8826968", sponsoringClub: "Self sponsored", city: "Pune" },
];

const Z4: Omit<DistrictClubRecord, "zone">[] = [
  { name: "Rotaract Club of Pune Heritage", riClubId: "213166", sponsoringClub: "Pune Heritage (Rotary Club)", charterDate: "18 December 2015", city: "Pune" },
  {
    name: "Rotaract Club of Balewadi High Street",
    riClubId: "8826659",
    sponsoringClub: "Pune Mideast (Rotaract Club); Scon Pro (Rotary Club)",
    charterDate: "28 August 2024",
    city: "Balewadi",
  },
  { name: "Rotaract Club of Sancheti Healthcare Academy", riClubId: "8825271", sponsoringClub: "Pune Phoenix (Rotary Club)", charterDate: "10 November 2022", city: "Pune" },
  { name: "Rotaract Club of Pune Royal", riClubId: "214473", sponsoringClub: "Pune South (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Christ University Lavasa", riClubId: "8826293", sponsoringClub: "Pune Central (Rotary Club)", charterDate: "18 March 2024", city: "Lavasa" },
  { name: "Rotaract Club of Pune Zenith", riClubId: "217271", sponsoringClub: "Pune Sinhagad Road (Rotary Club)", charterDate: "22 August 2019", city: "Pune" },
  { name: "Rotaract Club of Pune City Prabodhan", riClubId: "8826674", sponsoringClub: "Pune Fortune (Rotary Club)", charterDate: "3 September 2024", city: "Pune" },
  { name: "Rotaract Club of Pune University", riClubId: "8827499", sponsoringClub: "Pune University (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Magarpatta TrendSetters", riClubId: "8824104", sponsoringClub: "Pune Shaniwarwada (Rotaract Club)", charterDate: "30 July 2021", city: "Pune" },
  { name: "Rotaract Club of Pune City", riClubId: "8824015", sponsoringClub: "Poona North (Rotary Club)", charterDate: "8 August 2021", city: "Pune" },
  { name: "Rotaract Club of Sai Balaji Education Society", riClubId: "91148", sponsoringClub: "Akurdi Pune (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Synergy Next Gen", riClubId: "8825270", sponsoringClub: "Pune Synergy (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Ramachandran International Institute of Management Pune", riClubId: "8826135", sponsoringClub: "Pune Bavdhan Elite (Rotary Club)", city: "Pune" },
];

const Z5: Omit<DistrictClubRecord, "zone">[] = [
  { name: "Rotaract Club of ALUMNI", riClubId: "214181", sponsoringClub: "Pune Sarasbaug (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Mideast", riClubId: "85530", sponsoringClub: "Pune Mid-East (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Shaniwarwada", riClubId: "45125", sponsoringClub: "Pune Shaniwarwada (Rotary Club)", charterDate: "27 September 2006", city: "Pune" },
  { name: "Rotaract Club of Pune Kalyani Nagar", riClubId: "69048", sponsoringClub: "Pune Kalyani Nagar (Rotary Club)", charterDate: "26 August 2005", city: "Kalyani Nagar" },
  { name: "Rotaract Club of Pune Sinhagad Road", riClubId: "49040", sponsoringClub: "Pune Sinhagad Road (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Aurora", riClubId: "8827500", sponsoringClub: "Poona Downtown (Rotary Club)", charterDate: "21 July 2025", city: "Pune" },
  { name: "Rotaract Club of Pune Phoenix", riClubId: "8826482", sponsoringClub: "Self sponsored", city: "Pune" },
  { name: "Rotaract Club of Brihan Maharashtra College of Commerce", riClubId: "8826632", sponsoringClub: "Poona Mid Town (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Westside", riClubId: "8826885", sponsoringClub: "Pune West Side (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Vibrants", riClubId: "214094", sponsoringClub: "Pune Hillside (Rotary Club)", charterDate: "7 September 2016", city: "Pune" },
  { name: "Rotaract Club of International Institute of Management and Human Resource Development (W)", riClubId: "8826783", sponsoringClub: "Akurdi Pune (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of GEM", riClubId: "218200", sponsoringClub: "Pune Up-Town (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Indreshwar", riClubId: "218738", sponsoringClub: "Indapur (Rotary Club)", city: "Indapur" },
  { name: "Rotaract Club of Modern College Ganeshkhind Pune", riClubId: "216452", sponsoringClub: "Pune Up-Town (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of DIVYAZEP (S.P. College Pune)", riClubId: "8824256", sponsoringClub: "Pune East (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Modern College of Arts, Science & Commerce", riClubId: "212931", sponsoringClub: "Pune-Shivajinagar (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of MIT Academy of Engineering", riClubId: "8824993", sponsoringClub: "Pimpri Elite (Rotary Club)", city: "Pune" },
];

const Z6: Omit<DistrictClubRecord, "zone">[] = [
  { name: "Rotaract Club of DY Patil College of Engineering", riClubId: "8825529", sponsoringClub: "Pradhikaran Pune (Rotary Club)", charterDate: "3 March", city: "Pune" },
  { name: "Rotaract Club of Pune City Fortune", riClubId: "8823957", sponsoringClub: "Pune Fortune (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune City Legends", riClubId: "8826615", sponsoringClub: "Pune City Fortune (Rotaract Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Warje", riClubId: "91641", sponsoringClub: "Pune Warje (Rotary Club)", charterDate: "14 May 2014", city: "Warje" },
  { name: "Rotaract Club of Viman Nagar", riClubId: "215996", sponsoringClub: "Koregaon Park (Rotary Club)", city: "Viman Nagar" },
  { name: "Rotaract Club of Vishwakarma Institute of Technology, Pune", riClubId: "215650", sponsoringClub: "Pune NIBM (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Poona South", riClubId: "7283", sponsoringClub: "Pune South (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Renaissance", riClubId: "218199", city: "Pune" },
  { name: "Rotaract Club of Pune Vishwam", riClubId: "8826725", sponsoringClub: "Pune Laxmi Road (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Wisdom", riClubId: "8824638", sponsoringClub: "Pune Wisdom (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Roar NIBM", riClubId: "8827434", sponsoringClub: "Pune Pristine Paradise (Rotaract Club)", city: "Pune" },
  { name: "Rotaract Club of Genba Sopanrao Moze College of Engineering", riClubId: "8826700", sponsoringClub: "Poona West (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Sinhgad Institute of Management and Computer Application", riClubId: "8825382", sponsoringClub: "Pune Heritage (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Baner", riClubId: "8825923", sponsoringClub: "Pune Baner (Rotary Club)", charterDate: "18 September 2024", city: "Baner" },
  { name: "Rotaract Club of Anekant Institute of Management Studies", riClubId: "8826390", sponsoringClub: "Baramati (Rotary Club)", charterDate: "1 September 2023", city: "Pune" },
  { name: "Rotaract Club of AIT", riClubId: "217438", sponsoringClub: "Poona Airport (Rotary Club)", charterDate: "1 September 2023", city: "Pune" },
  // Spreadsheet listed Baner's charter ID again for SAII — keep stable district placeholder until RI ID confirmed.
  { name: "Rotaract Club of Symbiosis Artificial Intelligence Institute", riClubId: "3131-SAII-01", charterDate: "1 September 2023", city: "Pune" },
];

const Z7: Omit<DistrictClubRecord, "zone">[] = [
  { name: "Rotaract Club of Pune's Yuva", riClubId: "8826497", sponsoringClub: "Pune Parvati (Rotary Club)", charterDate: "16 January 2005", city: "Pune" },
  { name: "Rotaract Club of Pune Pride", riClubId: "90983", sponsoringClub: "Pune Pride (Rotary Club)", charterDate: "2013", city: "Pune" },
  { name: "Rotaract Club of Bibwewadi Pune", riClubId: "215167", sponsoringClub: "Bibwewadi Pune (Rotary Club)", charterDate: "5 September 2017", city: "Bibwewadi" },
  { name: "Rotaract Club of Pune Pristine Paradise", riClubId: "8824344", sponsoringClub: "Pune Pristine (Rotaract Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Katraj", riClubId: "80991", sponsoringClub: "Pune Katraj (Rotary Club)", charterDate: "10 May 2008", city: "Katraj" },
  { name: "Rotaract Club of Baramati", riClubId: "8824186", sponsoringClub: "Baramati (Rotary Club)", charterDate: "2 September 2021", city: "Baramati" },
  { name: "Rotaract Club of Pune Cantonment", riClubId: "212790", sponsoringClub: "Pune Cantonment (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Samrajya", riClubId: "8826718", sponsoringClub: "Self sponsored", city: "Pune" },
  { name: "Rotaract Club of Sinhgad College of Pharmacy", riClubId: "8826281", sponsoringClub: "Pune Nanded City (Rotary Club)", charterDate: "14 March 2024", city: "Pune" },
  { name: "Rotaract Club of Koregaon Park", riClubId: "215663", sponsoringClub: "Koregaon Park (Rotary Club)", city: "Koregaon Park" },
  { name: "Rotaract Club of Pune Camp Next Gen", riClubId: "217270", sponsoringClub: "Pune Camp (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Camp Pioneers", riClubId: "218252", sponsoringClub: "Pune Camp (Rotary Club)", charterDate: "15 May 2020", city: "Pune" },
  { name: "Rotaract Club of Pune Metro", riClubId: "8825935", sponsoringClub: "Pune Metro (Rotary Club)", city: "Pune" },
  { name: "Rotaract Club of Pune Gandhi Bhavan Adhyapak Mahavidyalaya", riClubId: "8826479", sponsoringClub: "Pune Gandhi Bhavan (Rotary Club)", city: "Pune" },
];

function withZone(zone: string, clubs: Omit<DistrictClubRecord, "zone">[]): DistrictClubRecord[] {
  return clubs.map((club) => ({ ...club, zone }));
}

export const DISTRICT_CLUBS: DistrictClubRecord[] = [
  ...withZone("Zone 1", Z1),
  ...withZone("Zone 2", Z2),
  ...withZone("Zone 3", Z3),
  ...withZone("Zone 4", Z4),
  ...withZone("Zone 5", Z5),
  ...withZone("Zone 6", Z6),
  ...withZone("Zone 7", Z7),
];

/** Official RI / district charter IDs — sole source of truth for club roster. */
export const OFFICIAL_CLUB_CHARTER_IDS = DISTRICT_CLUBS.map((club) => club.riClubId);

export function isOfficialDistrictClub(charterNumber: string | null | undefined) {
  return !!charterNumber && OFFICIAL_CLUB_CHARTER_IDS.includes(charterNumber);
}

/** Use in Prisma queries to exclude legacy/demo clubs from listings. */
export const OFFICIAL_DISTRICT_CLUB_FILTER = {
  charterNumber: { in: OFFICIAL_CLUB_CHARTER_IDS },
};

/** Official active clubs included in monthly reporting and exports. */
export const OFFICIAL_DISTRICT_REPORTING_CLUB_FILTER = {
  ...OFFICIAL_DISTRICT_CLUB_FILTER,
  status: "ACTIVE" as ClubStatus,
};

/** Limit member queries to official rotaract clubs (excludes district council roster). */
export const OFFICIAL_ROTARACT_MEMBER_FILTER = {
  club: OFFICIAL_DISTRICT_CLUB_FILTER,
};

export function clubDescription(club: DistrictClubRecord): string | undefined {
  const parts: string[] = [];
  if (club.sponsoringClub) parts.push(`Sponsoring club: ${club.sponsoringClub}`);
  if (club.charterDate) parts.push(`Chartered: ${club.charterDate}`);
  return parts.length ? parts.join(" · ") : undefined;
}

/** Best-effort parse for foundedAt from charter date strings. */
export function parseCharterDate(raw?: string): Date | undefined {
  if (!raw) return undefined;
  const cleaned = raw
    .replace(/\s+/g, " ")
    .replace(/(\d+)(st|nd|rd|th)/gi, "$1")
    .trim();
  if (/^\d{4}$/.test(cleaned)) {
    return new Date(`${cleaned}-07-01`);
  }
  const parsed = Date.parse(cleaned);
  if (Number.isNaN(parsed)) {
    const withYear = Date.parse(`${cleaned} 2020`);
    if (!Number.isNaN(withYear)) return new Date(withYear);
    return undefined;
  }
  return new Date(parsed);
}
