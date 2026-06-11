import { COUNCIL_PASSWORD } from "./council-users";

/** Technical system admin — created on every seed run */
export const SEED_ADMIN = {
  email: "admin@rotaract3131.org",
  password: "Admin@3131",
  name: "System Admin",
};

export const CLUB_LOGIN = {
  email: "club.panvel@rotaract3131.org",
  password: COUNCIL_PASSWORD,
  name: "Panvel Elite Club Login",
  role: "CLUB_PRESIDENT" as const,
  /** Panvel Elite — official district club portal login */
  riClubId: "217226",
};
