"use client";

import Image from "next/image";
import { Mail } from "lucide-react";
import type { CouncilUserSeed } from "@/lib/council-roster-data";
import {
  councilAvatarGradient,
  councilDisplayName,
  councilInitials,
  councilShortClub,
} from "@/lib/council-display";
import { cn } from "@/lib/utils";

export function CouncilMemberCard({
  member,
  featured = false,
  style,
}: {
  member: CouncilUserSeed;
  featured?: boolean;
  style?: React.CSSProperties;
}) {
  const initials = councilInitials(member.name);
  const displayName = councilDisplayName(member.name);
  const gradient = councilAvatarGradient(member.email);
  const clubShort = councilShortClub(member.club);
  const hasPhoto = Boolean(member.photo);

  return (
    <article
      className={cn(
        "council-member-card group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-900 shadow-md transition duration-500 ease-out",
        "hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10",
        featured ? "sm:col-span-2 lg:col-span-2" : ""
      )}
      style={style}
    >
      <div
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden",
          featured && "sm:aspect-[16/11]"
        )}
      >
        {hasPhoto ? (
          <>
            <Image
              src={member.photo!}
              alt={displayName}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-top transition duration-700 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
          </>
        ) : (
          <>
            <div
              className="absolute inset-0 transition duration-700 group-hover:scale-105"
              style={{ background: gradient }}
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 15%, white 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(255,255,255,0.25) 0%, transparent 40%)",
              }}
            />
            <span className="pointer-events-none absolute left-1/2 top-[28%] -translate-x-1/2 select-none font-display text-[5.5rem] font-bold leading-none text-white/10 sm:text-7xl">
              {initials}
            </span>
          </>
        )}

        <div className="council-card-ring pointer-events-none absolute -right-6 -top-6 h-28 w-28 opacity-0 transition duration-500 group-hover:opacity-100" />

        <div className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-gradient-to-b from-accent via-rose-400 to-indigo-400 transition duration-500 group-hover:scale-y-100" />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-4 pt-20 sm:px-5 sm:pb-5">
          <p className="font-display text-base font-bold leading-snug text-white sm:text-lg">
            {displayName}
          </p>
          <p className="mt-1.5 text-xs font-medium leading-snug text-rose-300 sm:text-sm">
            {member.title}
          </p>

          <div className="mt-3 max-h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
            <p className="text-[11px] leading-relaxed text-zinc-300 sm:text-xs">{member.club}</p>
            <a
              href={`mailto:${member.email}`}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition hover:bg-accent sm:text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <Mail className="h-3 w-3 shrink-0" aria-hidden />
              <span className="truncate">{member.email}</span>
            </a>
          </div>
        </div>

        <div className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-sm">
          {clubShort.length > 22 ? `${clubShort.slice(0, 20)}…` : clubShort}
        </div>
      </div>
    </article>
  );
}
