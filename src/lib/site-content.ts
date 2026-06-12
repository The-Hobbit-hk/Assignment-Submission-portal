export type ContentPage = {
  title: string;
  badge?: string;
  paragraphs: string[];
  signatory?: string;
  image?: {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
  };
};

export type SponsorTier = "Gold Partner" | "Silver Partner" | "Community Partner";

export type AnnualSponsor = {
  name: string;
  tier: SponsorTier;
  /** Short line shown on sponsor spotlight cards */
  tagline?: string;
  /** Optional logo path under /public */
  logo?: string;
  website?: string;
};

export const ANNUAL_SPONSORS: AnnualSponsor[] = [
  {
    name: "Pune Tech Solutions",
    tier: "Gold Partner",
    tagline: "Empowering digital-ready youth across Pune",
  },
  {
    name: "Western Maharashtra Healthcare",
    tier: "Gold Partner",
    tagline: "Health outreach with district-wide impact",
  },
  {
    name: "Konkan Infra Projects",
    tier: "Silver Partner",
    tagline: "Building communities, building leaders",
  },
  {
    name: "Bavdhan Business Park",
    tier: "Silver Partner",
    tagline: "Professional growth for young entrepreneurs",
  },
  {
    name: "Raigad Youth Foundation",
    tier: "Silver Partner",
    tagline: "Service leadership in Konkan & Raigad",
  },
  {
    name: "Camp Education Trust",
    tier: "Community Partner",
    tagline: "Education-first community programmes",
  },
  {
    name: "Shaniwarwada Media House",
    tier: "Community Partner",
    tagline: "Amplifying stories of service",
  },
  {
    name: "District Print & Signage Co.",
    tier: "Community Partner",
    tagline: "Visible support at every district event",
  },
  {
    name: "Pimpri Industrial Association",
    tier: "Community Partner",
    tagline: "Industry meets youth leadership",
  },
];

export const SPONSORSHIP = {
  title: "Partner with Rotaract District 3131",
  homeTeaser:
    "Reach 2,700+ Rotaractors across 101 clubs — CSR-ready visibility at district flagship events.",
  intro:
    "Support youth leadership, community service, and professional development across Pune and Raigad. Our district events reach 2700+ Rotaractors and 101 official clubs.",
  thankYou:
    "To our RIY 2026-27 partners — your belief in young leaders powers district assemblies, installations, service projects, and the REIGN journey across Pune and Raigad. We are proud to showcase you.",
  valueProps: [
    {
      label: "2,700+",
      title: "Rotaractors reached",
      detail: "Engaged young professionals across the district every Rotary year",
    },
    {
      label: "101",
      title: "Official clubs",
      detail: "Zone-wise presence from Pune to Raigad for sustained brand recall",
    },
    {
      label: "12+",
      title: "Flagship touchpoints",
      detail: "Assembly, installations, sports meet, trek, culturals & more",
    },
    {
      label: "CSR",
      title: "Purpose-led visibility",
      detail: "Align your brand with Rotary's ethics of service above self",
    },
  ],
  tiers: [
    {
      name: "Gold Partner",
      tagline: "Maximum district-wide visibility",
      featured: true,
      benefits: [
        "Premier logo placement on all district event banners",
        "Speaking slot at District Assembly",
        "Dedicated social media features & reels",
        "Name on district website hero partner wall",
        "VIP seating at flagship events",
      ],
    },
    {
      name: "Silver Partner",
      tagline: "Strong event-floor presence",
      benefits: [
        "Logo on event collateral & digital creatives",
        "Booth at flagship district events",
        "Newsletter & WhatsApp broadcast mention",
        "Partner spotlight on district channels",
        "Certificate of appreciation from DRR",
      ],
    },
    {
      name: "Community Partner",
      tagline: "Meaningful local recognition",
      benefits: [
        "Acknowledgement at club & district events",
        "Certificate of appreciation",
        "Listing on district website partner grid",
        "Invitation to select district programmes",
        "Association with youth-led service impact",
      ],
    },
  ],
} as const;

export const JOIN_ROTARACT = {
  rotaractorTitle: "Are you a Rotaractor?",
  rotaractorText:
    "Sign in to your club portal for reporting, events, bluebook tasks, and district resources. Already a member? Access your dashboard now.",
  joinTitle: "Want to join Rotaract?",
  joinText:
    "Rotaract is for young professionals aged 18+ who want to lead, serve, and grow. Find a club in your zone or contact the district team to start a new club.",
} as const;

export const DISTRICT_TESTIMONIALS = [
  {
    quote:
      "District 3131 gives every club a clear structure to grow — from reporting and events to council support. REIGN is not just a theme; it is how we lead this year.",
    name: "PHF. DRR. Dr. Karishma Awari",
    role: "District Rotaract Representative",
    club: "Rotaract Club of Pune Shaniwarwada",
  },
  {
    quote:
      "Serving as District General Secretary, I have seen how organised district systems help clubs deliver impact faster. Fellowship here is backed by real accountability.",
    name: "PHF. Rtr. Harshvardhan Kale",
    role: "District General Secretary",
    club: "Rotaract Club of Bavdhan Pioneers",
  },
  {
    quote:
      "Monthly reporting and transparent club data have made it easier for us to track progress across all 101 clubs. The district team is always approachable and supportive.",
    name: "Rtr. Dr. Aishwarya Patil",
    role: "District Secretary - Reporting",
    club: "Rotaract Club of Pune Shaniwarwada",
  },
  {
    quote:
      "From zone visits to flagship events, being part of this district has shaped my leadership. Rotaract 3131 is where service meets professional growth.",
    name: "Rtr. Aniket Sardar",
    role: "District Zonal Representative",
    club: "Rotaract Club of Khopoli",
  },
  {
    quote:
      "Bluebook assignments and council portfolios push you to think beyond your club. That district-wide perspective is what makes Rotaract special here.",
    name: "Rtr. Samrudhi Khade",
    role: "District Director - Professional Development",
    club: "Rotaract Club of Pune Zenith",
  },
  {
    quote:
      "Our club finds strength in the district network — shared resources, mentorship, and events that unite Rotaractors from Pune to Raigad every Rotary year.",
    name: "Rtr. Jayesh Chavan",
    role: "District Director - Club Service",
    club: "Rotaract Club of Pune City Fortune",
  },
] as const;

export const CONTACT = {
  phone: "+91-99999-99999",
  email: "rotaractdistrict3131@gmail.com",
  drrEmail: "rtr.dr.karishmaawari@gmail.com",
  address:
    "3rd Floor, Pratham Elite, Office No 303, opp. Civil Court Metro Station, near Pune District & Sessions Court, Tophakhana, Shivajinagar, Pune, Maharashtra 411005",
} as const;

export const ABOUT_PAGES: Record<string, ContentPage> = {
  "rotary-international": {
    title: "Rotary International",
    paragraphs: [
      "Rotary International is a universal network of 1.2 million acquaintances, companions, leaders, and problem-solvers who have a vision of the world where people unite and take action to create a long-lasting change – across the globe, in our communities, and ourselves.",
      "Rotary is a 110-year-old international chain of clubs consisting of phenomenal visionaries who, since the establishment of this chain have used their passion, energy and, intelligence to contribute to the development of a sustainable world.",
      "The mission of Rotary is to provide service to others, promote integrity, and advance world understanding, goodwill, and peace through our fellowship of business, professional, and community leaders. Whereas, the far-sighted vision of Rotary sees a world where people unite and take action to create lasting change across the globe, in our communities, and in ourselves.",
    ],
  },
  "rotaract-district-3131": {
    title: "We are Rotaract District 3131",
    badge: "About Us",
    paragraphs: [
      "Rotaract District 3131 is a dynamic and impactful non-profit organization dedicated to creating positive change in the world, working in close collaboration with Rotary International District 3131 (RID 3131). Functioning directly under the guidance of Rotary International, Rotaract District 3131 empowers young leaders to make a significant difference in their communities and beyond.",
      "Formation and Scope: Rotaract District 3131 was established at the start of Rotary International Year 2008-09, following the bifurcation of RID 3130. It encompasses the Raigad and Pune revenue districts of Maharashtra, India.",
      "Membership and Reach: It is comprised of over 100 Rotaract clubs with a vibrant network of 2700+ Rotaractors. Rotaractors are individuals aged 18 and above, fostering a diverse and inclusive community of young leaders.",
      "Rotaractors belong to an age group of above 18 years (no age limit) and primarily work in the standing committees of Professional Development, Community Service, Club Service, International Service, and other avenues that develop leadership and fellowship.",
    ],
  },
  "message-riy-2026-27": {
    title: "Message for RIY 2026-27",
    badge: "REIGN",
    image: {
      src: "/reign-theme-riy-2026-27.png",
      alt: "REIGN — Rotaract Empowering Individuals for Growth and Networking, RIY 2026-27, RID 3131",
      containerClassName:
        "relative aspect-[3/4] w-full max-w-xs overflow-hidden rounded-xl bg-black sm:max-w-sm",
      className: "object-contain p-4 sm:p-6",
    },
    paragraphs: [
      "Dear Rotaractors of District 3131,",
      "It gives me immense pleasure to welcome you to Rotary International Year 2026-27 under our district theme REIGN — Rotaract Empowering Individuals for Growth and Networking.",
      "This year is about unlocking the potential within every Rotaractor: nurturing leadership, strengthening professional skills, deepening our commitment to community service, and building networks that endure beyond the Rotary year.",
      "REIGN calls us to empower one another — in our clubs, across our zones, and throughout Pune and Raigad. When individuals grow, clubs grow. When clubs grow, our district creates impact that is measurable, inclusive, and lasting.",
      "I invite every club president, secretary, and member to carry REIGN into your meetings, projects, fellowships, and reporting. Let us lead with purpose, serve with compassion, and network with integrity.",
      "Together, let us make RIY 2026-27 a year of empowered leaders, stronger communities, and proud Rotaract across RID 3131.",
    ],
    signatory: "DRR Dr. Karishma Awari · RIY 2026-27 · RID 3131",
  },
  "from-leaders-desk": {
    title: "From Leaders Desk",
    badge: "Leadership",
    paragraphs: [
      "Leadership in Rotaract District 3131 is built on accountability, transparency, and service above self. The district team works closely with club presidents and secretaries to ensure every initiative aligns with Rotary's core values.",
      "Through regular council meetings, bluebook assignments, and monthly reporting, we maintain excellence across administration, events, and community projects.",
      "We invite every member to engage with district programs, share feedback, and contribute to a culture where young leaders grow into changemakers.",
    ],
  },
};

export const RESOURCE_PAGES: Record<
  string,
  { title: string; description: string; externalUrl?: string }
> = {
  "rotaract-handbook": {
    title: "Rotaract Handbook",
    description:
      "Official handbook covering Rotaract structure, club operations, reporting standards, and district guidelines for RIY 2026-27.",
  },
  "rotary-code-of-policies": {
    title: "Rotary Code of Policies",
    description:
      "Reference document for Rotary International policies governing clubs, districts, and member conduct.",
  },
  "rotary-club-excellence-guide": {
    title: "Rotary Club Excellence Guide",
    description:
      "Best practices and benchmarks for building high-performing Rotary and Rotaract clubs.",
  },
  "council-on-legislation": {
    title: "Council on Legislation (COL)",
    description:
      "Materials related to the Council on Legislation — Rotary's legislative body for constitutional and policy matters.",
  },
  "rotaract-directory": {
    title: "Rotaract Directory",
    description:
      "District directory of Rotaract clubs, office bearers, and council contacts for RID 3131.",
  },
  "district-calendar": {
    title: "District Calendar",
    description:
      "Key dates, district events, reporting windows, and council milestones for the Rotary year.",
  },
  "rotary-standard-constitution": {
    title: "Rotary Standard Constitution",
    description:
      "Standard constitution document for Rotary clubs — foundational governance reference.",
  },
  "manual-of-procedure": {
    title: "MOP - Manual of Procedure",
    description:
      "Rotary Manual of Procedure — procedural rules for districts, clubs, and RI governance.",
  },
  "logo-resources": {
    title: "Logo Resources",
    description:
      "Official Rotaract and Rotary logos, brand guidelines, and approved assets for district use.",
    externalUrl: "/logo-rotaract-3131.png",
  },
  "awards-structure-riy-2026-27": {
    title: "Awards Structure RIY 2026-27",
    description:
      "District awards categories, eligibility criteria, and submission timelines for RIY 2026-27 under the REIGN theme.",
  },
};

export const COUNCIL_PAGES: Record<string, ContentPage> = {
  drr: {
    title: "District Rotaract Representative (DRR)",
    badge: "Council 26-27",
    image: {
      src: "/reign-theme-riy-2026-27.png",
      alt: "REIGN theme logo for RIY 2026-27, Rotaract District 3131",
      containerClassName:
        "relative aspect-[3/4] w-full max-w-xs overflow-hidden rounded-xl bg-black sm:max-w-sm",
      className: "object-contain p-4 sm:p-6",
    },
    paragraphs: [
      "PHF. DRR. Dr. Karishma Awari leads Rotaract District 3131 for RIY 2026-27 under the theme REIGN — Rotaract Empowering Individuals for Growth and Networking.",
      "The District Rotaract Representative represents all clubs at the district and international level, oversees council operations, and aligns district strategy with Rotary International goals.",
      "Read the full message for the Rotary year on the Message for RIY 2026-27 page.",
    ],
  },
  "core-council": {
    title: "Core Council",
    badge: "Council 26-27",
    paragraphs: [
      "The Core Council comprises key district officers responsible for administration, events, protocols, and reporting.",
      "Members collaborate on district-wide initiatives, support clubs, and drive the annual district plan.",
    ],
  },
  "sub-core": {
    title: "Sub Core",
    badge: "Council 26-27",
    paragraphs: [
      "Sub Core teams extend the Core Council's reach through specialized portfolios and zonal coordination.",
      "They assist with event execution, club visits, and follow-up on district directives.",
    ],
  },
  "district-executive-council": {
    title: "District Executive Council",
    badge: "Council 26-27",
    paragraphs: [
      "The District Executive Council is the governing body that reviews district performance, approves major initiatives, and ensures accountability across committees.",
    ],
  },
  "event-chairperson": {
    title: "Event Chairperson",
    badge: "Council 26-27",
    paragraphs: [
      "Event Chairpersons lead flagship district events — from planning and budgets to execution and post-event reporting.",
      "They coordinate with clubs, sponsors, and council members to deliver memorable, impact-driven experiences.",
    ],
  },
  convenors: {
    title: "Convenors",
    badge: "Council 26-27",
    paragraphs: [
      "Convenors manage standing committees such as professional development, community service, and international service.",
      "They mobilize Rotaractors, track outcomes, and report progress through the district bluebook system.",
    ],
  },
};
