"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CouncilMemberCard } from "@/components/site/council-member-card";
import { SiteReveal } from "@/components/site/site-reveal";
import type { CouncilUserSeed } from "@/lib/council-roster-data";
import { Input } from "@/components/ui/input";

export function CouncilRosterGrid({
  members,
  sectionTitle,
}: {
  members: CouncilUserSeed[];
  sectionTitle?: string;
}) {
  const [query, setQuery] = useState("");
  const showSearch = members.length > 6;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.club.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q)
    );
  }, [members, query]);

  if (members.length === 0) return null;

  const featured = members.length === 1;

  return (
    <section className="border-t border-zinc-200 bg-gradient-to-b from-zinc-50 to-white py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <SiteReveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                District Council 26-27
              </p>
              <h3 className="mt-2 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
                {sectionTitle ?? "Council members"}
              </h3>
              <p className="mt-2 max-w-xl text-sm text-zinc-600">
                {members.length} leader{members.length === 1 ? "" : "s"} steering Rotaract District
                3131 this Rotary year. Hover a card for contact details.
              </p>
            </div>
            {showSearch && (
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="search"
                  placeholder="Search by name or role…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                  aria-label="Search council members"
                />
              </div>
            )}
          </div>
        </SiteReveal>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-zinc-500">No members match your search.</p>
        ) : (
          <div
            className={
              featured
                ? "mx-auto mt-10 max-w-md"
                : "mt-10 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6"
            }
          >
            {filtered.map((member, index) => (
              <SiteReveal
                key={member.email}
                delay={Math.min(index * 60, 360)}
                className="h-full"
              >
                <CouncilMemberCard member={member} featured={featured} />
              </SiteReveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
