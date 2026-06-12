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
      <div
        className={cn(
          "mt-8 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6",
          members.length <= 3 && "md:grid-cols-3",
          members.length === 2 && "max-w-2xl mx-auto"
        )}
      >
        {members.map((member, index) => (
          <SiteReveal
            key={member.email}
            delay={Math.min(index * 60, 420)}
            className="h-full"
          >
            <CouncilMemberCard member={member} />
          </SiteReveal>
        ))}
      </div>
    </>
  );
}
