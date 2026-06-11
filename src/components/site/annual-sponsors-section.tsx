import Image from "next/image";
import { ANNUAL_SPONSORS, type SponsorTier } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const TIER_STYLES: Record<SponsorTier, string> = {
  "Gold Partner": "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-white text-amber-800",
  "Silver Partner": "border-zinc-300/80 bg-gradient-to-br from-zinc-100/90 to-white text-zinc-700",
  "Community Partner": "border-rose-200/60 bg-gradient-to-br from-rose-50/50 to-white text-accent",
};

function sponsorInitials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 2 && !/^(pvt|ltd|co|the|and)$/i.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function SponsorCard({ name, tier, logo, website }: (typeof ANNUAL_SPONSORS)[number]) {
  const content = (
    <>
      <div className="flex h-16 items-center justify-center sm:h-20">
        {logo ? (
          <Image
            src={logo}
            alt={name}
            width={160}
            height={64}
            className="max-h-14 w-auto object-contain sm:max-h-16"
          />
        ) : (
          <span className="font-display text-2xl font-bold tracking-tight text-zinc-400/90 sm:text-3xl">
            {sponsorInitials(name) || name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <p className="mt-3 text-center text-sm font-semibold leading-snug text-zinc-900">{name}</p>
      <p
        className={cn(
          "mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
          TIER_STYLES[tier]
        )}
      >
        {tier}
      </p>
    </>
  );

  const className =
    "depth-card flex flex-col items-center rounded-2xl border border-zinc-200/80 bg-white p-5 transition hover:border-accent/25 hover:shadow-md";

  if (website) {
    return (
      <a
        href={website}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        aria-label={`${name} website`}
      >
        {content}
      </a>
    );
  }

  return <div className={className}>{content}</div>;
}

export function AnnualSponsorsSection({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const sponsors = compact ? ANNUAL_SPONSORS.slice(0, 6) : ANNUAL_SPONSORS;

  return (
    <div className={cn(className)}>
      <div className={compact ? "mb-6" : "mb-8 text-center"}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          RIY 2026-27
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
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600">
            Thank you to the brands and organisations that partner with Rotaract District 3131
            to empower youth leadership and community service across Pune and Raigad.
          </p>
        )}
      </div>

      <div
        className={cn(
          "grid gap-4",
          compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
        )}
      >
        {sponsors.map((sponsor) => (
          <SponsorCard key={sponsor.name} {...sponsor} />
        ))}
      </div>
    </div>
  );
}
