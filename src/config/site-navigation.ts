export type SiteNavItem = {
  label: string;
  href?: string;
  children?: SiteNavItem[];
};

export const SITE_NAV: SiteNavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Rotaract District 3131", href: "/about#rotaract-district-3131" },
      { label: "Rotary International", href: "/about#rotary-international" },
      { label: "Message for RIY 2026-27", href: "/about#message-riy-2026-27" },
    ],
  },
  {
    label: "Useful Resources",
    children: [
      { label: "All Resources", href: "/resources" },
      { label: "Rotaract Handbook", href: "/resources/rotaract-handbook" },
      { label: "Rotary Code of Policies", href: "/resources/rotary-code-of-policies" },
      { label: "Rotary Club Excellence Guide", href: "/resources/rotary-club-excellence-guide" },
      { label: "Council on Legislation (COL)", href: "/resources/council-on-legislation" },
      { label: "Rotaract Directory", href: "/resources/rotaract-directory" },
      { label: "District Calendar", href: "/resources/district-calendar" },
      { label: "Rotary Standard Constitution", href: "/resources/rotary-standard-constitution" },
      { label: "MOP - Manual of procedure", href: "/resources/manual-of-procedure" },
      { label: "Logo Resources", href: "/resources/logo-resources" },
      { label: "Awards Structure RIY 2026-27", href: "/resources/awards-structure-riy-2026-27" },
    ],
  },
  { label: "Clubs", href: "/clubs" },
  { label: "Events", href: "/events" },
  { label: "Calendar", href: "/calendar" },
  { label: "Sponsorship", href: "/sponsorship" },
  {
    label: "Council 26-27",
    children: [
      { label: "Council Overview", href: "/council" },
      { label: "DRR", href: "/council/drr" },
      { label: "Core Council", href: "/council/core-council" },
      { label: "Zonal Representatives", href: "/council/sub-core" },
      { label: "District Executive Council", href: "/council/district-executive-council" },
      { label: "Event Chairperson", href: "/council/event-chairperson" },
      { label: "Convenors", href: "/council/convenors" },
    ],
  },
  { label: "Contact us", href: "/contact" },
];

export const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/rotaractdistrict3131?igsh=MjlnMDdwbHpvYmIw",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/198JKSdDAt/",
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@rotaractdistrict3131?si=N5xQM5pCyE5gWWHI",
  },
] as const;
