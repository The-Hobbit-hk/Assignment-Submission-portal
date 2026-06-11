import { Building2, MapPin, Users } from "lucide-react";
import type { DistrictZoneMeta } from "@/lib/district-clubs-data";
import type { PublicClub } from "@/lib/public-site-data";

export function ClubsByZone({
  zones,
  zoneMeta,
}: {
  zones: Record<string, PublicClub[]>;
  zoneMeta?: DistrictZoneMeta[];
}) {
  const entries = Object.entries(zones);

  if (entries.length === 0) {
    return <p className="text-center text-zinc-500">No clubs listed yet.</p>;
  }

  return (
    <div className="space-y-12">
      {entries.map(([zone, clubs]) => {
        const meta = zoneMeta?.find((z) => z.zone === zone);
        return (
        <section key={zone}>
          <h2 className="font-display text-2xl font-bold text-zinc-900">{zone}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {clubs.length} club{clubs.length === 1 ? "" : "s"}
            {meta?.reps.length ? ` · ${meta.reps.join(" · ")}` : ""}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clubs.map((club) => (
              <article
                key={club.id}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-accent/30 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-900">{club.name}</h3>
                    {club.presidentName && (
                      <p className="mt-1 text-xs text-zinc-600">
                        President: {club.presidentName}
                      </p>
                    )}
                    {club.city && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3" />
                        {club.city}
                      </p>
                    )}
                  </div>
                </div>
                {club.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-zinc-600">{club.description}</p>
                )}
                {club.charterNumber && (
                  <p className="mt-2 text-xs text-zinc-400">Club ID: {club.charterNumber}</p>
                )}
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-zinc-500">
                    <Users className="h-3.5 w-3.5 text-accent" />
                    {club.memberCount} members
                  </span>
                  <span
                    className={
                      club.status === "ACTIVE"
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }
                  >
                    {club.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      );
      })}
    </div>
  );
}
