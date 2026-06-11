import { siteConfig } from "@/config/site";

/** Public-facing trust metrics shown on the landing page and district materials. */
export const DISTRICT_PUBLIC_STATS = [
  { label: "Rotaract Clubs", value: "101" },
  { label: "Rotary Year", value: siteConfig.rotaryYear },
  { label: "Region", value: "Pune & Raigad" },
  { label: "Rotary Intl. District", value: "3131" },
] as const;

export const DISTRICT_PILLARS = [
  {
    title: "Service",
    description:
      "Community projects and humanitarian action that create measurable impact across Pune and Raigad.",
  },
  {
    title: "Leadership",
    description:
      "Structured pathways for young professionals to lead clubs, zones, and district portfolios with accountability.",
  },
  {
    title: "Fellowship",
    description:
      "A district-wide network connecting Rotaractors, Rotary partners, and alumni through shared purpose.",
  },
] as const;
