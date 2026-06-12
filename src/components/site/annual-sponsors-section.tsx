import Image from "next/image";
import { Award, Crown, Heart, Medal } from "lucide-react";
import {
  ANNUAL_SPONSORS,
  SPONSORSHIP,
  type AnnualSponsor,
  type SponsorTier,
} from "@/lib/site-content";
import { cn } from "@/lib/utils";

const TIER_ORDER: SponsorTier[] = ["Gold Partner", "Silver Partner", "Community Partner"];

const TIER_CONFIG: Record<
  SponsorTier,
  {
    heading: string;
    subheading: string;
    icon: typeof Crown;
    badge: string;
    badgeClass: string;
    cardClass: string;
    initialsClass: string;
    gridClass: string;
  }
> = {
  "Gold Partner": {
    heading: "Gold Partners",
    subheading: "Our premier allies — featured across district flagship events",
    icon: Crown,
    badge: "Premier Partner",
    badgeClass:
      "border-amber-300/80 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900",
    cardClass:
      "border-2 border-amber-300/50 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 shadow-lg shadow-amber-100/50 hover:border-amber-400/60 hover:shadow-xl hover:shadow-amber-100/60",
    initialsClass: "text-amber-400/80",
    gridClass: "mx-auto max-w-3xl grid gap-6 sm:grid-cols-2",
  },
  "Silver Partner": {
    heading: "Silver Partners",
    subheading: "Trusted brands with strong on-ground presence at district programmes",
    icon: Medal,
    badge: "Silver Partner",
    badgeClass: "border-zinc-300 bg-gradient-to-r from-zinc-100 to-white text-zinc-700",
    cardClass:
      "border border-zinc-300/80 bg-gradient-to-br from-zinc-50 to-white shadow-md hover:border-zinc-400/60 hover:shadow-lg",
    initialsClass: "text-zinc-400/90",
    gridClass: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
  },
  "Community Partner": {
    heading: "Community Partners",
    subheading: "Local champions investing in youth service across Pune & Raigad",
    icon: Heart,
    badge: "Community Partner",
    badgeClass: "border-rose-200 bg-gradient-to-r from-rose-50 to-white text-accent",
    cardClass:
      "border border-rose-200/70 bg-white shadow-sm hover:border-accent/30 hover:shadow-md",
    initialsClass: "text-rose-300/90",
    gridClass: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
  },
};

function sponsorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/^(pvt|ltd|co|the|and)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function SponsorSpotlightCard({
  sponsor,
  tier,
}: {
  sponsor: AnnualSponsor;
  tier: SponsorTier;
}) {
  const config = TIER_CONFIG[tier];
  const isGold = tier === "Gold Partner";

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            config.badgeClass
          )}
        >
          {tier === "Gold Partner" && <Crown className="h-3 w-3" aria-hidden />}
          {config.badge}
        </span>
        <Award
          className={cn("h-4 w-4 shrink-0 opacity-40", isGold ? "text-amber-600" : "text-zinc-400")}
          aria-hidden
        />
      </div>

      <div
        className={cn(
          "mt-4 flex items-center justify-center rounded-xl bg-white/60",
          isGold ? "h-20 sm:h-24" : "h-16 sm:h-20"
        )}
      >
        {sponsor.logo ? (
          <Image
            src={sponsor.logo}
            alt={sponsor.name}
            width={180}
            height={72}
            className="max-h-16 w-auto object-contain sm:max-h-20"
          />
        ) : (
          <span
            className={cn(
              "font-display font-bold tracking-tight",
              config.initialsClass,
              isGold ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"
            )}
          >
            {sponsorInitials(sponsor.name) || sponsor.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <p
        className={cn(
          "mt-4 text-center font-semibold leading-snug text-zinc-900",
          isGold ? "text-base sm:text-lg" : "text-sm"
        )}
      >
        {sponsor.name}
      </p>
      {sponsor.tagline && (
        <p className="mt-2 text-center text-xs leading-relaxed text-zinc-500">{sponsor.tagline}</p>
      )}
    </>
  );

  const className = cn(
    "group relative flex flex-col rounded-2xl p-5 transition duration-300 sm:p-6",
    config.cardClass,
    isGold && "sm:p-7"
  );

  if (sponsor.website) {
    return (
      <a
        href={sponsor.website}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`Visit ${sponsor.name}`}
      >
        {inner}
      </a>
    );
  }

  return <article className={className}>{inner}</article>;
}

function TierSponsorGroup({
  tier,
  sponsors,
  compact,
}: {
  tier: SponsorTier;
  sponsors: AnnualSponsor[];
  compact?: boolean;
}) {
  if (sponsors.length === 0) return null;

  const config = TIER_CONFIG[tier];
  const Icon = config.icon;
  const displaySponsors = compact ? sponsors.slice(0, tier === "Gold Partner" ? 2 : 3) : sponsors;

  return (
    <div className={cn(tier !== "Gold Partner" && "mt-12")}>
      <div className={cn("mb-6", compact ? "text-left" : "text-center")}>
        <div
          className={cn(
            "flex items-center gap-2",
            compact ? "justify-start" : "justify-center"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              tier === "Gold Partner"
                ? "text-amber-600"
                : tier === "Silver Partner"
                  ? "text-zinc-500"
                  : "text-accent"
            )}
            aria-hidden
          />
          <h3 className="font-display text-lg font-bold text-zinc-900 sm:text-xl">
            {config.heading}
          </h3>
        </div>
        {!compact && (
          <p className="mx-auto mt-2 max-w-xl text-sm text-zinc-500">{config.subheading}</p>
        )}
      </div>

      <div className={config.gridClass}>
        {displaySponsors.map((sponsor) => (
          <SponsorSpotlightCard key={sponsor.name} sponsor={sponsor} tier={tier} />
        ))}
      </div>
    </div>
  );
}

export function AnnualSponsorsSection({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const tiersToShow = compact
    ? (["Gold Partner", "Silver Partner"] as SponsorTier[])
    : TIER_ORDER;

  return (
    <div className={cn(className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-accent/15 bg-gradient-to-br from-rose-50/80 via-white to-amber-50/40 p-6 sm:p-8",
          compact ? "mb-6" : "mb-10"
        )}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-amber-200/20 blur-2xl" />

        <div className={compact ? "" : "text-center"}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            RIY 2026-27 · Partner wall
          </p>
          <h2
            className={cn(
              "font-display font-bold text-zinc-900",
              compact ? "mt-2 text-xl sm:text-2xl" : "mt-2 text-2xl sm:text-3xl"
            )}
          >
            Our Proud Annual Sponsors
          </h2>
          {!compact && (
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
              {SPONSORSHIP.thankYou}
            </p>
          )}
        </div>
      </div>

      {tiersToShow.map((tier) => (
        <TierSponsorGroup
          key={tier}
          tier={tier}
          sponsors={ANNUAL_SPONSORS.filter((s) => s.tier === tier)}
          compact={compact}
        />
      ))}

      {!compact && (
        <p className="mt-12 text-center text-sm text-zinc-500">
          Your brand could be featured here next Rotary year —{" "}
          <span className="font-medium text-accent">join our partner family.</span>
        </p>
      )}
    </div>
  );
}
