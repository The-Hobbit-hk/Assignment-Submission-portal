/**
 * Sandbox club for portal testing — not part of the official district roster.
 * Hidden from public club listings; preserved when syncing official clubs.
 */
export const DEMO_CLUB_CHARTER_ID = "DEMO-3131";

export const DEMO_CLUB = {
  name: "Demo Club (Testing Only)",
  charterNumber: DEMO_CLUB_CHARTER_ID,
  zone: "Demo",
  city: "Mumbai",
  description: "Internal test club for club-portal QA. Not shown on the public site.",
} as const;

export const DEMO_CLUB_LOGIN = {
  email: "club.demo@rotaract3131.org",
  password: process.env.DEMO_CLUB_PASSWORD ?? "DemoClub@3131",
  name: "Demo Club President",
  role: "CLUB_PRESIDENT" as const,
};
