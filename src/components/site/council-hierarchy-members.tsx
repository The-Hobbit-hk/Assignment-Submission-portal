"use client";

import { CouncilMemberCard } from "@/components/site/council-member-card";
import { SiteReveal } from "@/components/site/site-reveal";
import type { CouncilUserSeed } from "@/lib/council-roster-data";
import { cn } from "@/lib/utils";

export function CouncilHierarchyMembers({
  members,
  layout,
}: {
  members: CouncilUserSeed[];
  layout: "hero" | "grid";
}) {
  if (members.length === 0) return null;

  if (layout === "hero") {
    return (
      <div className="mt-10 flex justify-center sm:mt-12">
        <SiteReveal className="w-full max-w-[240px] sm:max-w-[280px]">
          <CouncilMemberCard member={members[0]} />
        </SiteReveal>
      </div>
    );
  }

  return (
    <>
      <p className="mx-auto mt-4 max-w-lg text-center text-xs text-zinc-500 sm:text-sm">
        Hover a card for club and contact details.
      </p>
      {/* Fixed-width, centered cards so every group renders identical card sizes
          regardless of how many members it has. */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-5 lg:gap-6">
        {members.map((member, index) => (
          <SiteReveal
            key={member.email}
            delay={Math.min(index * 60, 420)}
            className={cn(
              "w-[calc(50%-0.5rem)] sm:w-[220px] lg:w-[236px]"
            )}
          >
            <CouncilMemberCard member={member} />
          </SiteReveal>
        ))}
      </div>
    </>
  );
}
