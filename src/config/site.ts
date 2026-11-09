const DEFAULT_APP_URL = "http://localhost:3000";

function resolveAppUrl(raw: string | undefined) {
  const value = raw?.trim();
  if (!value) return DEFAULT_APP_URL;
  try {
    return new URL(value).origin;
  } catch {
    return DEFAULT_APP_URL;
  }
}

export const siteConfig = {
  name: "Rotaract District 3131",
  shortName: "Rotaract District 3131",
  logo: "/logo-rotaract-3131.png",
  logoMark: "/logo-rotaract-mark.png",
  reignLogo: "/reign-theme-riy-2026-27.png",
  favicon: "/reign-icon.png",
  homeHeroBackground: "/home-hero-background.png",
  rotaryYear: "2026-27",
  theme: "REIGN",
  themeTagline: "Rotaract Empowering Individuals for Growth and Networking",
  drr: "Dr. Karishma Awari",
  description:
    "Official website of Rotaract District 3131 — empowering young leaders through fellowship, service, and professional development across Pune & Raigad.",
  url: resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL),
  district: "District 3131",
  organization: "Rotaract",
  supportEmail: "support@rotaract3131.org",
} as const;
