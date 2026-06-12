import Image from "next/image";
import type { CouncilUserSeed } from "@/lib/council-roster-data";
import {
  councilAvatarGradient,
  councilDisplayName,
  councilInitials,
} from "@/lib/council-display";
import { cn } from "@/lib/utils";

export type CouncilPortraitSize = "hero" | "standard";

export function CouncilPortrait({
  member,
  size = "standard",
}: {
  member: CouncilUserSeed;
  size?: CouncilPortraitSize;
}) {
  const displayName = councilDisplayName(member.name);
  const hasPhoto = Boolean(member.photo);

  return (
    <figure
      className={cn(
        "flex flex-col items-center text-center",
        size === "hero" ? "max-w-[240px] sm:max-w-[280px]" : "max-w-[160px] sm:max-w-[180px]"
      )}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden bg-zinc-800",
          size === "hero" ? "aspect-[3/4]" : "aspect-[3/4]"
        )}
      >
        {hasPhoto ? (
          <Image
            src={member.photo!}
            alt={displayName}
            fill
            sizes={size === "hero" ? "280px" : "180px"}
            className="object-cover object-top"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: councilAvatarGradient(member.email) }}
          >
            <span className="font-display text-4xl font-bold text-white/25 sm:text-5xl">
              {councilInitials(member.name)}
            </span>
          </div>
        )}
      </div>
      <figcaption className="mt-3 w-full">
        <p
          className={cn(
            "font-semibold leading-snug text-white",
            size === "hero" ? "text-base sm:text-lg" : "text-xs sm:text-sm"
          )}
        >
          {displayName}
        </p>
        <p
          className={cn(
            "mt-1 leading-snug text-zinc-400",
            size === "hero" ? "text-sm" : "text-[11px] sm:text-xs"
          )}
        >
          {member.title}
        </p>
      </figcaption>
    </figure>
  );
}
