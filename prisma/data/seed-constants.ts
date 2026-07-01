import { COUNCIL_PASSWORD } from "./council-users";

/**
 * Technical system admin — created on every seed run.
 * Override the password in production via SEED_ADMIN_PASSWORD; the literal
 * fallback is for local development only. Rotate immediately after seeding.
 */
export const SEED_ADMIN = {
  email: process.env.SEED_ADMIN_EMAIL ?? "admin@rotaract3131.org",
  password: process.env.SEED_ADMIN_PASSWORD ?? "Admin@3131",
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
