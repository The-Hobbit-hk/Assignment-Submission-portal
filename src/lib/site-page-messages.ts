import { DISTRICT_OFFICIAL_CLUB_COUNT } from "@/lib/district-clubs-data";

/** Short, curiosity-driven welcome lines shown at the top of each public page. */
export function getSiteWelcomeMessage(pathname: string): string {
  if (pathname === "/") {
    return "Step inside a district where service, leadership, and fellowship collide.";
  }
  if (pathname === "/about" || pathname.startsWith("/about/")) {
    return "Every great movement starts with a story — discover ours.";
  }
  if (pathname === "/clubs") {
    return `${DISTRICT_OFFICIAL_CLUB_COUNT} clubs across Pune & Raigad — which community will you find?`;
  }
  if (pathname === "/council" || pathname.startsWith("/council/")) {
    return "Meet the minds steering District 3131 this Rotary year.";
  }
  if (pathname === "/events" || pathname.startsWith("/events/")) {
    return "Something is always happening — see what’s next on the calendar.";
  }
  if (pathname === "/calendar") {
    return "Mark the dates that matter — district life moves fast.";
  }
  if (pathname === "/resources" || pathname.startsWith("/resources/")) {
    return "Tools, guides, and knowledge — built for curious Rotaractors.";
  }
  if (pathname === "/contact") {
    return "Questions spark change — we’re listening.";
  }
  if (pathname === "/sponsorship") {
    return "Partner with impact — see how brands grow with Rotaract.";
  }
  return "Rotaract District 3131 — where curiosity becomes action.";
}
