export const PORTAL_OPTIONS = [
  {
    id: "council",
    title: "Council Member",
    description: "Submit assigned bluebook tasks and upload proof.",
    loginHint: "rtrsurajsurkutla@gmail.com",
  },
  {
    id: "secretary",
    title: "District Secretary",
    description: "Assign bluebook tasks to council members.",
    loginHint: "rtr.harshvardhan3131@gmail.com",
  },
  {
    id: "club",
    title: "Club Portal",
    description: "Submit monthly admin & event reporting during the reporting window.",
    loginHint: "club.demo@rotaract3131.org",
  },
  {
    id: "reporting",
    title: "Reporting Secretary",
    description: "View all club reports and export admin/events data.",
    loginHint: "rtr.dr.aishwaryapatil@gmail.com",
  },
  {
    id: "admin",
    title: "District Admin",
    description: "Full district ERP access and management.",
    loginHint: "rtr.dr.karishmaawari@gmail.com",
  },
] as const;

export type PortalId = (typeof PORTAL_OPTIONS)[number]["id"];

export function getPortalMeta(id: string | null) {
  return PORTAL_OPTIONS.find((p) => p.id === id) ?? null;
}
