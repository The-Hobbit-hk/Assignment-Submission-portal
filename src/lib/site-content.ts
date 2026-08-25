import { DISTRICT_OFFICIAL_CLUB_COUNT } from "@/lib/district-clubs-data";

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

// Real RIY 2026-27 partners are announced through the season. Until then the
// public sponsor wall renders a "coming soon" board instead of placeholders.
export const ANNUAL_SPONSORS: AnnualSponsor[] = [];

export const SPONSORSHIP = {
  title: "Partner with Rotaract District 3131",
  homeTeaser: `Reach 2,700+ Rotaractors across ${DISTRICT_OFFICIAL_CLUB_COUNT} clubs — CSR-ready visibility at district flagship events.`,
  intro: `Support youth leadership, community service, and professional development across Pune and Raigad. Our district events reach 2700+ Rotaractors and ${DISTRICT_OFFICIAL_CLUB_COUNT} official clubs.`,
  thankYou:
    "To our RIY 2026-27 partners — your belief in young leaders powers district assemblies, installations, service projects, and the REIGN journey across Pune and Raigad. We are proud to showcase you.",
  valueProps: [
    {
      label: "2,700+",
      title: "Rotaractors reached",
      detail: "Engaged young professionals across the district every Rotary year",
    },
    {
      label: String(DISTRICT_OFFICIAL_CLUB_COUNT),
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

/** District DEI wellbeing partnership — public home section (not a sponsor block). */
export const VENT_OUT_2_ME = {
  title: "Vent Out 2 Me",
  badge: "A District DEI Initiative",
  logo: "/partners/vent-out-2-me.png",
  url: "https://www.ventout2.me",
  referralCode: "ROTARACT DISTRICT 3131",
  intro:
    "Between meetings, deadlines, and responsibilities, don’t forget to take a moment for the person behind the service you.",
  body:
    "Rotaract District 3131, in collaboration with VentOut2Me, brings you access to a free, online, and completely anonymous platform where you can connect with a certified psychotherapist in a safe and confidential space.",
  support:
    "Whether you need to vent, reflect, or simply be heard, remember you don’t have to carry everything alone.",
  closing: "Because taking care of yourself is the first step towards taking care of others.",
  stepsHeading: "Book your 30-minute session in 3 simple steps",
  steps: [
    "Visit www.ventout2.me",
    "Use the referral code: ROTARACT DISTRICT 3131",
    "Speak freely in a safe, confidential, and non-judgmental environment.",
  ],
} as const;

export const DISTRICT_TESTIMONIALS = [
  {
    quote: `My Rotaract Journey – A Journey of Service, Leadership & Transformation

Rotaract has been one of the greatest blessings of my life. It didn't just make me a Rotaractor—it gave me a new identity. It transformed me into a more confident, responsible, and service-oriented individual.

For me, Rotaract is much more than an organization; it is a platform that empowers young leaders to serve the community while developing their personalities. Through this incredible journey, I have gained countless life skills, including leadership, communication, public speaking, presentation skills, event management, and professionalism. Rotaract has also improved my standard of living by teaching me discipline, time management, and the value of teamwork.

One of the biggest gifts Rotaract has given me is a strong network. I have met inspiring leaders, built meaningful relationships with Rotarians, and found friends who have become family. The love, respect, and recognition I receive from the community today are all because of Rotaract.

Throughout my journey, I have had the privilege of serving in multiple leadership positions within my club. Serving as the President of Rotaract Club of Daund College during RIY 2023–24 was truly a God-gifted opportunity. It was a year filled with learning, challenges, achievements, networking, friendships, fun, and unforgettable memories.

During my presidential tenure, our club successfully completed 100 impactful projects dedicated to community service and youth development. This remarkable journey was recognized when I was honored with the Outstanding President Award by Rotaract District 3131.

Today, I am deeply honored to serve as the District Interact Rotaract Relationship Officer (RIY 2026–27) for Rotaract District 3131. This role is another milestone in my journey and a wonderful opportunity to strengthen the bond between Interact and Rotaract while creating a lasting impact across the district.

Once a Rotaractor, always a Rotaractor. I will always be grateful to Rotaract for making me the person I am today.`,
    name: "Rtr. Prajwal Bande",
    role: "District Interact Rotaract Relationship Officer",
    club: "Rotaract Club of Daund College",
    photo: "/council/prajwal-bande.png",
  },
  {
    quote:
      "Rotaract District 3131 has this amazing way of turning youth potential into real, ground-level impact. Stepping up as a District Zonal Representative on the district team is proving to be an incredible experience. It's giving me a front-row seat to watch our clubs challenge themselves and show what true leadership looks like in action. Honestly, every single day here is becoming a continuous journey of learning, leading, and growing alongside everyone.",
    name: "Rtr. Vedant Chaudhari",
    role: "District Zonal Representative, Zone 5",
    club: "Rotaract Club of Pimpri",
    photo: "/council/vedant-chaudhari.png",
  },
  {
    quote:
      "Being a part of Rotaract District 3131 has been an incredibly enriching journey. The district truly embodies the spirit of \"Service Above Self\" by creating meaningful opportunities for leadership, fellowship, and community impact. Every initiative reflects dedication, innovation, and teamwork, inspiring Rotaractors to grow both personally and professionally. Proud to be a part of a district that empowers individuals to lead with purpose, serve with compassion, and create lasting change. Here's to many more milestones and meaningful moments together!",
    name: "Rtr. Vaishnavi Kedari",
    role: "District Co-Director, Community Service",
    club: "Rotaract Club of Symbiosis Skills and Professional University",
    photo: "/council/vaishnavi-kedari.png",
  },
  {
    quote: `Rotaract never just gave me positions; it gave me purpose.

From learning how to lead a small team to leading a chartered club, from creating content behind the scenes to representing an entire zone, every role has taught me that true leadership is about creating opportunities for others to grow.

The friendships, late-night planning calls, countless service projects, impossible deadlines, and unforgettable victories have shaped me into someone I never imagined I'd become. Rotaract has shown me that ordinary people, united by a common purpose, can create extraordinary impact.

If there's one thing Rotaract has taught me, it's this: titles may change, tenures may end, but the people you inspire and the legacy you leave behind will always outlive them.`,
    name: "Rtr. Pratham Pokharkar",
    role: "IPP & Treasurer",
    club: "Rotaract Club of Pune Aurora",
    photo: "/council/pratham-pokharkar.png",
  },
  {
    quote: `Joining Rotaract has been one of the most transformative experiences of my life. It has helped me grow as a leader, improve my communication skills, and build meaningful friendships with people who share a passion for service.

Through Rotaract, I have had the opportunity to organize community service projects, coordinate events, and work with dedicated teams. Every project has taught me the importance of teamwork, responsibility, and creating a positive impact in society.

As a dance instructor and an active Rotaractor, I enjoy combining creativity with service by using dance and cultural activities to connect with people and spread awareness. Rotaract has given me the confidence to take initiative, lead with purpose, and continue learning every day.

For me, Rotaract is more than an organization—it is a family that inspires me to "Service Above Self." I am grateful for every opportunity to serve, grow, and inspire others, and I look forward to continuing this journey.`,
    name: "Rtr. Prem Bansode",
    role: "District Zonal Representative",
    club: "Rotaract Club of Daund College",
    photo: "/council/prem-bansode.png",
  },
  {
    quote:
      "Rotaract gave me family before it gave me friends. What started as service projects became something deeper — a space where I grew, led, and found purpose. Today, I don't just do Rotaract; I live it, every single day.",
    name: "Rtr. Jayesh Chavan",
    role: "District Director — Club Service",
    club: "Rotaract Club of Pune City Fortune",
    photo: "/council/jayesh-chavan.png",
  },
] as const;

export const CONTACT = {
  phone: "+91-80077-18639",
  email: "rotaractdistrict3131@gmail.com",
  drrEmail: "rtr.dr.karishmaawari@gmail.com",
  address:
    "World of Aesthetics Hair & Skin Clinic, Flat no. 4, Sumit Apartments, DP Rd, near D.A.V School, Raagdari Society, Aundh, Pune, Maharashtra 411067, India",
} as const;

export const ABOUT_SECTION_ORDER = [
  "rotaract-district-3131",
  "rotary-international",
  "message-riy-2026-27",
] as const;

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
      "Read the full message for the Rotary year on the About page.",
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
    title: "Zonal Representatives",
    badge: "Council 26-27",
    paragraphs: [
      "Zonal Representatives extend the Core Council's reach across zones, coordinating clubs and driving district initiatives on the ground.",
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
