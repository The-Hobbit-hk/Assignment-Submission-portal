"use client";

import { useMemo, useState } from "react";
import { Building2, Mail, MapPin, Search, Users } from "lucide-react";
import type { DistrictZoneMeta } from "@/lib/district-clubs-data";
import type { PublicClub } from "@/lib/public-site-data";
import { cn } from "@/lib/utils";

export function ClubsByZone({
  zones,
  zoneMeta,
}: {
  zones: Record<string, PublicClub[]>;
  zoneMeta?: DistrictZoneMeta[];
}) {
  const [query, setQuery] = useState("");
  const [activeZone, setActiveZone] = useState<string>("all");

  const zoneNames = useMemo(() => Object.keys(zones), [zones]);
  const totalClubs = useMemo(
    () => Object.values(zones).reduce((sum, clubs) => sum + clubs.length, 0),
    [zones]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const result: [string, PublicClub[]][] = [];

    for (const [zone, clubs] of Object.entries(zones)) {
      if (activeZone !== "all" && zone !== activeZone) continue;

      const matched = q
        ? clubs.filter((club) => {
            const haystack = [club.name, club.city, club.zone, club.presidentName]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return haystack.includes(q);
          })
        : clubs;

      if (matched.length > 0) result.push([zone, matched]);
    }

    return result;
  }, [zones, query, activeZone]);

  const matchCount = filtered.reduce((sum, [, clubs]) => sum + clubs.length, 0);

  if (zoneNames.length === 0) {
    return <p className="text-center text-zinc-500">No clubs listed yet.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Search + zone filter */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clubs by name, city, or president…"
            className="w-full rounded-full border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            aria-label="Search clubs"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveZone("all")}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition sm:text-sm",
              activeZone === "all"
                ? "border-accent bg-accent text-white"
                : "border-zinc-300 text-zinc-600 hover:border-accent hover:text-accent"
            )}
          >
            All zones
          </button>
          {zoneNames.map((zone) => (
            <button
              key={zone}
              type="button"
              onClick={() => setActiveZone(zone)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition sm:text-sm",
                activeZone === zone
                  ? "border-accent bg-accent text-white"
                  : "border-zinc-300 text-zinc-600 hover:border-accent hover:text-accent"
              )}
            >
              {zone}
            </button>
          ))}
        </div>

        <p className="text-sm text-zinc-500">
          Showing {matchCount} of {totalClubs} clubs
          {query.trim() ? ` for “${query.trim()}”` : ""}
          {activeZone !== "all" ? ` in ${activeZone}` : ""}.
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 py-12 text-center text-zinc-500">
          No clubs match your search. Try a different name, city, or zone.
        </p>
      ) : (
        <div className="space-y-12">
          {filtered.map(([zone, clubs]) => {
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
                      className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-accent/30 hover:shadow-md"
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
                        <p className="mt-3 line-clamp-2 text-sm text-zinc-600">
                          {club.description}
                        </p>
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
                            club.status === "ACTIVE" ? "text-emerald-600" : "text-amber-600"
                          }
                        >
                          {club.status}
                        </span>
                      </div>
                      {club.presidentEmail && (
                        <a
                          href={`mailto:${club.presidentEmail}?subject=${encodeURIComponent(
                            `Joining ${club.name}`
                          )}`}
                          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border border-accent/30 px-3 py-1.5 text-xs font-medium text-accent transition hover:bg-accent hover:text-white"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          Contact to join
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
