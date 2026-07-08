import type { PublicEventRegistration } from "@/generated/prisma/client";

export function serializePublicRegistration(r: PublicEventRegistration) {
  return {
    id: r.id,
    eventId: r.eventId,
    name: r.name,
    clubName: r.clubName,
    riId: r.riId,
    registeredAt: r.registeredAt.toISOString(),
  };
}

export function appBaseUrl(request?: Request): string {
  if (request) {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    if (host) return `${proto}://${host}`;
  }
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export function registrationFileUrl(
  baseUrl: string,
  eventId: string,
  registrationId: string,
  file: "payment-proof" | "government-id"
): string {
  return `${baseUrl}/api/events/${eventId}/public-registrations/${registrationId}/${file}`;
}
