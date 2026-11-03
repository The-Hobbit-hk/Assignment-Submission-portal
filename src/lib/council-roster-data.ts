import type { UserRole } from "@/generated/prisma/client";

/**
 * Initial password applied to seeded council/club logins.
 * MUST be overridden in production via SEED_COUNCIL_PASSWORD; the literal
 * fallback is for local development only. Rotate immediately after seeding
 * and have each user change their password on first login.
 */
export const COUNCIL_PASSWORD =
  process.env.SEED_COUNCIL_PASSWORD ?? "Rotaract@3131";

export type CouncilGroupSlug =
  | "drr"
  | "core-council"
  | "sub-core"
  | "district-executive-council"
  | "event-chairperson"
  | "convenors";

export type CouncilUserSeed = {
  name: string;
  email: string;
  title: string;
  club: string;
  /** Contact number for the council member profile */
  phone?: string;
  /** Public path under /council/ when a headshot is available */
  photo?: string;
  role: UserRole;
  group: CouncilGroupSlug;
};

/** District-level club used for council member profiles and live scores */
export const DISTRICT_COUNCIL_CLUB = {
  name: "Rotaract District 3131 — District Council",
  riClubId: "3131-COUNCIL",
  zone: "District",
  city: "Pune",
};

/** Limit member queries to the official district council roster only. */
export const COUNCIL_MEMBER_FILTER = {
  status: "ACTIVE" as const,
  club: { charterNumber: DISTRICT_COUNCIL_CLUB.riClubId },
};

/** District Council 26-27 — official roster */
export const COUNCIL_USERS: CouncilUserSeed[] = [
  { name: "PHF. DRR. Dr. Karishma Awari", email: "rtr.dr.karishmaawari@gmail.com", title: "District Rotaract Representative", club: "Rotaract Club of Pune Shaniwarwada", phone: "8007718639", photo: "/council/karishma-awari.png", role: "SUPER_ADMIN", group: "drr" },
  { name: "PHF. PDRR. Drishti Singh", email: "rtrdrishtisingh@gmail.com", title: "District Learning Facilitator", club: "Rotaract Club of Humanitas", phone: "8623818358", role: "COUNCIL_MEMBER", group: "core-council" },
  // Elevated portal role retained for website/admin access; public title is DLF.
  { name: "PHF. Rtr. Harshvardhan Kale", email: "rtr.harshvardhan3131@gmail.com", title: "District Learning Facilitator", club: "Rotaract Club of Bavdhan Pioneers", phone: "8390662266", photo: "/council/harshvardhan-kale.png", role: "DISTRICT_SECRETARY", group: "core-council" },
  { name: "Rtr. Suraj Surkutla", email: "rtrsurajsurkutla@gmail.com", title: "District Secretary - Administration", club: "Rotaract Club of Pune Shaniwarwada", phone: "8888606148", photo: "/council/suraj-surkutla.png", role: "COUNCIL_MEMBER", group: "core-council" },
  { name: "Rtr. Hamid Shaikh", email: "rtn.rtr.hamids@gmail.com", title: "District Secretary - Events", club: "Rotaract Club of Aundh Smartcity", phone: "9075076076", photo: "/council/hamid-shaikh.png", role: "COUNCIL_MEMBER", group: "core-council" },
  { name: "Rtr. Disha Daga", email: "rtrdishadaga@gmail.com", title: "District Secretary - Protocols", club: "Rotaract Club of Bibwewadi Pune", phone: "9175902873", photo: "/council/disha-daga.png", role: "COUNCIL_MEMBER", group: "core-council" },
  { name: "Rtr. Dr. Aishwarya Patil", email: "rtr.dr.aishwaryapatil@gmail.com", title: "District Secretary - Reporting", club: "Rotaract Club of Pune Shaniwarwada", phone: "9420820645", photo: "/council/aishwarya-patil.png", role: "REPORTING_SECRETARY", group: "core-council" },
  { name: "PHF. Rtr. Sharvindu Jogdand", email: "sharvindu@gmail.com", title: "District Treasurer", club: "Rotaract Club of Pune Warje", phone: "9822259567", photo: "/council/sharvindu-jogdand.png", role: "COUNCIL_MEMBER", group: "core-council" },
  { name: "Rtr. Dr. Ashlesha Deshpande", email: "rtr.drashlesha3131@gmail.com", title: "District Club Advisor", club: "Rotaract Club of Pune Heritage", phone: "9673992798", photo: "/council/ashlesha-deshpande.png", role: "COUNCIL_MEMBER", group: "core-council" },
  { name: "Rtr. Rohan Puri", email: "rohanpuri777@gmail.com", title: "Zonal Advisor", club: "Rotaract Club of Khopoli", phone: "9623385585", photo: "/council/rohan-puri.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Aniket Sardar", email: "anisardar777@gmail.com", title: "District Zonal Representative", club: "Rotaract Club of Khopoli", phone: "7249364780", photo: "/council/aniket-sardar.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Vedant Chirmade", email: "vedant.chirmade@gmail.com", title: "District Zonal Representative", club: "Rotaract Club of Pimpri", phone: "9763468031", photo: "/council/vedant-chirmade.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Vedant Chaudhari", email: "vedantpchaudhari41@gmail.com", title: "District Zonal Representative", club: "Rotaract Club of Pimpri", phone: "7517415655", photo: "/council/vedant-chaudhari.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Tisha Sancheti", email: "tishasancheti2512@gmail.com", title: "District Zonal Representative", club: "Rotaract Club of Pune Camp Next Gen", phone: "9423642651", photo: "/council/tisha-sancheti.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Pratham Pokharkar", email: "prathampokharkar10@gmail.com", title: "District Zonal Representative", club: "Rotaract Club of Pune Aurora", phone: "9112998682", photo: "/council/pratham-pokharkar.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Rajas Uchagaonkar", email: "rtrrsu@gmail.com", title: "District Zonal Representative", club: "Rotaract Club of Pune City Fortune", phone: "7387219017", photo: "/council/rajas-uchagaonkar.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Prem Bansode", email: "prembansode.7172@gmail.com", title: "District Zonal Representative", club: "Rotaract Club of Daund College", phone: "9139485891", photo: "/council/prem-bansode.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Prerna Bhilare", email: "prernabhilare11@gmail.com", title: "Assistant Zonal Representative", club: "Rotaract Club of Sinhgad College Of Pharmacy", phone: "9356955275", photo: "/council/prerna-bhilare.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Aditya Verma", email: "rtr.adityaverma@gmail.com", title: "Assistant Zonal Representative", club: "Rotaract Club of Nigdi Pune", phone: "7727924691", photo: "/council/aditya-verma.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Shrushti Shirore", email: "shrushtishirore@gmail.com", title: "Assistant Zonal Representative", club: "Rotaract Club of Pune Aurora", phone: "9960377967", photo: "/council/shrushti-shirore.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Sarthak Ambhore", email: "rtr.sarthak.ambhore@gmail.com", title: "Assistant Zonal Representative", club: "Rotaract Club of Pimpri", phone: "8767130848", photo: "/council/sarthak-ambhore.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Rohit Kumbhar", email: "rohitkumbhar98@gmail.com", title: "Assistant Zonal Representative", club: "Rotaract Club of Bavdhan Pioneers", phone: "7720034004", photo: "/council/rohit-kumbhar.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Sumedh Gite", email: "rtrsumedhgite@gmail.com", title: "Assistant Zonal Representative", club: "Rotaract Club of Aundh Smartcity", phone: "8830552784", photo: "/council/sumedh-gite.png", role: "COUNCIL_MEMBER", group: "sub-core" },
  { name: "Rtr. Samrudhi Khade", email: "samrudhikhade26@gmail.com", title: "District Director - Professional Development", club: "Rotaract Club of Pune Zenith", phone: "7620067710", photo: "/council/samrudhi-khade.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Mansi Sharma", email: "sharmamansi27052004@gmail.com", title: "District Co-Director - Professional Development", club: "Rotaract Club of Dr. D. Y. Patil B - School", phone: "9529661686", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Jayesh Chavan", email: "rtrjayeshchavan@gmail.com", title: "District Director - Club Service", club: "Rotaract Club of Pune City Fortune", phone: "8007993969", photo: "/council/jayesh-chavan.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Risha Mridha", email: "rishaxmridha@gmail.com", title: "District Co-Director - Club Service", club: "Rotaract Club of Bavdhan Pioneers", phone: "9766497118", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "PHF. Rtr. Aslam Dhanani", email: "aslam.dhanani20@gmail.com", title: "District Director - Community Service", club: "Rotaract Club of Balewadi High Street", phone: "7875013378", photo: "/council/aslam-dhanani.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Vaishnavi Kedari", email: "rtr.vaishnavikedari@gmail.com", title: "District Co-Director - Community Service", club: "Rotaract Club of Symbiosis Skills and Professional University", phone: "9168490256", photo: "/council/vaishnavi-kedari.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Pranav Gandhi", email: "pranavsgandhi99@gmail.com", title: "District Co-Director - International Service", club: "Rotaract Club of Bibwewadi Pune", phone: "9022862171", photo: "/council/pranav-gandhi.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Chinmayee Bartakke", email: "chinmayee.bartakke14@gmail.com", title: "District Director - Diversity, Equity & Inclusion", club: "Rotaract Club of Viman Nagar", phone: "8087199305", photo: "/council/chinmayee-bartakke.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Faizan Tamboli", email: "faijantamboli@gmail.com", title: "District Director - Communications", club: "Rotaract Club of Pune Shaniwarwada", phone: "8390161786", photo: "/council/faizan-tamboli.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Shrawani Shendkar", email: "shshendkar27@gmail.com", title: "District Director - Public Image", club: "Rotaract Club of Genba Sopanrao Moze College of Engineering", phone: "9503438388", photo: "/council/shrawani-shendkar.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Salvin Padvi", email: "salvinpadvi17@gmail.com", title: "District Officer - Chief Branding", club: "Rotaract Club of Pune Aurora", phone: "8483936490", photo: "/council/salvin-padvi.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Janhavi Yeole", email: "janhaviyeole5@gmail.com", title: "District Officer - Public Relations", club: "Rotaract Club of Pune Zenith", phone: "8484819467", photo: "/council/janhavi-yeole.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Shreeraj Nilkanth", email: "sikowitzclicks@gmail.com", title: "District Officer - Public Relations", club: "Rotaract Club of Panvel Industrial Town", phone: "9112118545", photo: "/council/shreeraj-nilkanth.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Sanika Malve", email: "sanikamalve13@gmail.com", title: "District Officer - Public Relations", club: "Rotaract Club of Pune Shaniwarwada", phone: "9356165645", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Sushant Chavan", email: "sushantchavan072@gmail.com", title: "District Officer - Editing", club: "Rotaract Club of Sinhgad College Of Pharmacy", phone: "9529936483", photo: "/council/sushant-chavan.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Harshal Nikam", email: "rtrharshalnikam@gmail.com", title: "District Officer - Editing", club: "Rotaract Club of Pune Heritage", phone: "7447231160", photo: "/council/harshal-nikam.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Tanay Soni", email: "tanaysoni2004@gmail.com", title: "District Officer - Editing", club: "Rotaract Club of Dr. D. Y. Patil B - School", phone: "8839004331", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Vageesha Karhadkar", email: "vageesha1603@gmail.com", title: "District Officer - Editing", club: "Rotaract Club of Magarpatta Trendsetters", phone: "7972519012", photo: "/council/vageesha-karhadkar.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Shubham Raut", email: "rtr.shubhamraut@gmail.com", title: "District Sergeant-at-Arms", club: "Rotaract Club of Pimpri", phone: "7666948443", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Snehal Jadhav", email: "rtrsnehaljadhav@gmail.com", title: "District Sergeant-at-Arms", club: "Rotaract Club of Balewadi High Street", phone: "9112382425", photo: "/council/snehal-jadhav.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Pranav Pisal", email: "pranavpisal23@gmail.com", title: "District Officer - Grants & RYLA", club: "Rotaract Club of Pimpri", phone: "9579806278", photo: "/council/pranav-pisal.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Adhishree Thakar", email: "adhishree1997@gmail.com", title: "District Officer - Rotary Rotaract Relations", club: "Rotaract Club of Pune Zenith", phone: "8624966745", photo: "/council/adhishree-thakar.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Prajwal Bande", email: "prajwalrbande@gmail.com", title: "District Officer - Membership Development & Interact Rotaract Relations", club: "Rotaract Club of Daund College", phone: "9552392356", photo: "/council/prajwal-bande.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Gaurav Golecha", email: "rtrgauravgolecha@gmail.com", title: "District Officer - Professional Assistance", club: "Rotaract Club of Pune Samrajya", phone: "7720002120", photo: "/council/gaurav-golecha.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Talha Shaikh", email: "rtr.talhashaikh@gmail.com", title: "District Officer - Professional Assistance", club: "Rotaract Club of Aundh Smartcity", phone: "7020892804", photo: "/council/talha-shaikh.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "PHF. DRRE. Adv. Sattyajeet Karale Patil", email: "sattyajeet.rotaract@gmail.com", title: "District Legal Advisor", club: "Rotaract Club of Pune Samrajya", phone: "9921064569", photo: "/council/sattyajeet-karale-patil.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Devsharan Singh", email: "devsharan52@gmail.com", title: "District Coordinator - Website", club: "Rotaract Club of Aundh Smartcity", phone: "9823441701", photo: "/council/devsharan-singh.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Ashi Agarwal", email: "ashiagarwal2001@gmail.com", title: "District Coordinator - Multi District Events", club: "Rotaract Club of Roar NIBM", phone: "7219003115", photo: "/council/ashi-agarwal.png", role: "COUNCIL_MEMBER", group: "event-chairperson" },
  { name: "Rtr. Abhishek Dixit", email: "rtr.abhishekdixit@gmail.com", title: "District Coordinator - Mahadaan", club: "Rotaract Club of Vibrants", phone: "8007005846", photo: "/council/abhishek-dixit.png", role: "COUNCIL_MEMBER", group: "event-chairperson" },
  { name: "Rtr. Sanjana Pawar", email: "rtrsanjanapawar@gmail.com", title: "District Chairperson - World Rotaract Week", club: "Rotaract Club of Vibrants", phone: "7498463946", photo: "/council/sanjana-pawar.png", role: "COUNCIL_MEMBER", group: "event-chairperson" },
  { name: "PHF. Rtr. Vansh Chawla", email: "vanshchawla101@gmail.com", title: "District Chairperson - RI Foundation & District Convenor - District Sports Meet", club: "Rotaract Club of Pimpri", phone: "9881931113", photo: "/council/vansh-chawla.png", role: "COUNCIL_MEMBER", group: "convenors" },
  { name: "Rtr. Vedant Buge", email: "rtrvedantbuge@gmail.com", title: "District Officer - Without Portfolio", club: "Rotaract Club of Pune Kalyani Nagar", phone: "8767243352", photo: "/council/vedant-buge.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Priya Bhagwani", email: "rtrpriyabhagwani@gmail.com", title: "District Officer - Without Portfolio", club: "Rotaract Club of Nigdi Pune", phone: "8421980758", photo: "/council/priya-bhagwani.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "PHF. Rtr. Ameya Mhaske", email: "ameya.rotaract@gmail.com", title: "District Officer - Without Portfolio", club: "Rotaract Club of Pune Shaniwarwada", phone: "8806614124", photo: "/council/ameya-mhaske.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "PHF. Rtr. Madhu Pimprikar", email: "rtrmadhupimprikar@gmail.com", title: "District Officer - Without Portfolio", club: "Rotaract Club of Pune Shaniwarwada", phone: "7218027577", photo: "/council/madhu-pimprikar.png", role: "COUNCIL_MEMBER", group: "district-executive-council" },
  { name: "Rtr. Amruta Potdukhe", email: "amruta9106potdukhe@gmail.com", title: "District Convenor - DRR and Council Installation", club: "Rotaract Club of Sinhgad College of Pharmacy", phone: "8856835779", photo: "/council/amruta-potdukhe.png", role: "COUNCIL_MEMBER", group: "convenors" },
  { name: "Rtr. Digvijay Lad", email: "digvijayguddu@gmail.com", title: "District Convenor - District Trek", club: "Rotaract Club of Pune City Fortune", phone: "9112133484", photo: "/council/digvijay-lad.png", role: "COUNCIL_MEMBER", group: "convenors" },
  { name: "Rtr. Vijeta Kulkarni", email: "vvkulkarni134@gmail.com", title: "District Convenor - District Culturals", club: "Rotaract Club of Pune Samrajya", phone: "8767208894", photo: "/council/vijeta-kulkarni.png", role: "COUNCIL_MEMBER", group: "convenors" },
];

export function getCouncilByGroup(group: CouncilGroupSlug): CouncilUserSeed[] {
  return COUNCIL_USERS.filter((u) => u.group === group);
}

/** Initial demo points for council live scores (replaced by bluebook sync over time). */
export function councilSeedPoints(index: number): number {
  return Math.max(80, 420 - index * 6);
}
