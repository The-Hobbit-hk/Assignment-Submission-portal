export type ContentPage = {
  title: string;
  badge?: string;
  paragraphs: string[];
  image?: { src: string; alt: string };
};

export const SPONSORSHIP = {
  title: "Partner with Rotaract District 3131",
  intro:
    "Support youth leadership, community service, and professional development across Pune and Raigad. Our district events reach 2700+ Rotaractors and 100+ clubs.",
  tiers: [
    {
      name: "Gold Partner",
      benefits: ["Logo on district event banners", "Speaking slot at District Assembly", "Social media features"],
    },
    {
      name: "Silver Partner",
      benefits: ["Logo on event collateral", "Booth at flagship district events", "Newsletter mention"],
    },
    {
      name: "Community Partner",
      benefits: ["Acknowledgement at club events", "Certificate of appreciation", "District website listing"],
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

export const CONTACT = {
  phone: "+91-9657870768",
  email: "rotaractdistrict3131@gmail.com",
  drrEmail: "nashikkar4295@gmail.com",
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
  "message-riy-2025-26": {
    title: "Message for RIY 2025-26",
    badge: "RIY 2025-26",
    paragraphs: [
      "As we embark on Rotary International Year 2025-26, Rotaract District 3131 stands united under the theme of service, fellowship, and sustainable impact.",
      "This year calls on every Rotaractor to lead with empathy, collaborate across clubs, and translate ideas into measurable community outcomes. Together we will strengthen professional development, expand humanitarian projects, and celebrate the spirit of Rotaract across Pune and Raigad.",
      "Let us adapt, unite, build resilience, and aspire to create lasting change — for our districts, our communities, and ourselves.",
    ],
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
      "Official handbook covering Rotaract structure, club operations, reporting standards, and district guidelines for RIY 2025-26.",
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
  "awards-structure-riy-2025-26": {
    title: "Awards Structure RIY 2025-26",
    description:
      "District awards categories, eligibility criteria, and submission timelines for RIY 2025-26.",
  },
};

export const COUNCIL_PAGES: Record<string, ContentPage> = {
  drr: {
    title: "District Rotaract Representative (DRR)",
    badge: "Council 25-26",
    paragraphs: [
      "The District Rotaract Representative leads Rotaract District 3131, representing all clubs at the district and international level.",
      "The DRR oversees council operations, aligns district strategy with Rotary International goals, and mentors club leadership across Pune and Raigad.",
    ],
  },
  "core-council": {
    title: "Core Council",
    badge: "Council 25-26",
    paragraphs: [
      "The Core Council comprises key district officers responsible for administration, events, protocols, and reporting.",
      "Members collaborate on district-wide initiatives, support clubs, and drive the annual district plan.",
    ],
  },
  "sub-core": {
    title: "Sub Core",
    badge: "Council 25-26",
    paragraphs: [
      "Sub Core teams extend the Core Council's reach through specialized portfolios and zonal coordination.",
      "They assist with event execution, club visits, and follow-up on district directives.",
    ],
  },
  "district-executive-council": {
    title: "District Executive Council",
    badge: "Council 25-26",
    paragraphs: [
      "The District Executive Council is the governing body that reviews district performance, approves major initiatives, and ensures accountability across committees.",
    ],
  },
  "event-chairperson": {
    title: "Event Chairperson",
    badge: "Council 25-26",
    paragraphs: [
      "Event Chairpersons lead flagship district events — from planning and budgets to execution and post-event reporting.",
      "They coordinate with clubs, sponsors, and council members to deliver memorable, impact-driven experiences.",
    ],
  },
  convenors: {
    title: "Convenors",
    badge: "Council 25-26",
    paragraphs: [
      "Convenors manage standing committees such as professional development, community service, and international service.",
      "They mobilize Rotaractors, track outcomes, and report progress through the district bluebook system.",
    ],
  },
};
