import type { UserRole } from "@/generated/prisma/client";
import { COUNCIL_PASSWORD } from "@/lib/council-roster-data";

export type ClubLoginSeed = {
  email: string;
  password: string;
  name: string;
  role: Extract<UserRole, "CLUB_PRESIDENT" | "CLUB_SECRETARY">;
  riClubId: string;
};

export const CLUB_PORTAL_LOGINS: ClubLoginSeed[] = [
  {
    email: "club.panvel@rotaract3131.org",
    password: COUNCIL_PASSWORD,
    name: "Panvel Elite Club Login",
    role: "CLUB_PRESIDENT",
    riClubId: "217226",
  },
  {
    email: "bavdhan@rotaract3131.org",
    password: COUNCIL_PASSWORD,
    name: "Bavdhan Pioneers Club Login",
    role: "CLUB_PRESIDENT",
    riClubId: "8827103",
  },
];
