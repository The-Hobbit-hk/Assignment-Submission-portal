export const siteConfig = {
  name: "Rotaract District 3131 ERP",
  shortName: "Rotaract District 3131",
  logo: "/logo-rotaract-3131.png",
  logoMark: "/logo-rotaract-mark.png",
  description:
    "Enterprise resource planning platform for Rotaract District 3131 operations, clubs, and district leadership.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  district: "District 3131",
  organization: "Rotaract",
  supportEmail: "support@rotaract3131.org",
} as const;
