import { Check, Sparkles } from "lucide-react";
import { SPONSORSHIP } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function SponsorshipTierCards({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "grid gap-6",
        compact ? "sm:grid-cols-3" : "md:grid-cols-3"
      )}
    >
      {SPONSORSHIP.tiers.map((tier) => {
        const isGold = tier.name === "Gold Partner";
        const featured = "featured" in tier && tier.featured;

        return (
          <div
            key={tier.name}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-white p-6 transition",
              featured
                ? "border-amber-300/70 shadow-lg shadow-amber-100/40 ring-1 ring-amber-200/50 md:-mt-2 md:pb-8"
                : "border-zinc-200 shadow-sm hover:border-accent/25 hover:shadow-md",
              compact && "p-4"
            )}
          >
            {featured && (
              <span className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                <Sparkles className="h-3 w-3" aria-hidden />
                Most visibility
              </span>
            )}

            <h3
              className={cn(
                "font-display font-bold",
                isGold ? "text-amber-700" : "text-accent",
                compact ? "text-base" : "text-xl"
              )}
            >
              {tier.name}
            </h3>
            {"tagline" in tier && tier.tagline && (
              <p className="mt-1 text-xs font-medium text-zinc-500">{tier.tagline}</p>
            )}

            <ul className={cn("mt-5 flex-1 space-y-2.5", compact && "mt-3 space-y-2")}>
              {tier.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className={cn(
                    "flex items-start gap-2 text-zinc-600",
                    compact ? "text-xs" : "text-sm"
                  )}
                >
                  <Check
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      isGold ? "text-amber-600" : "text-accent"
                    )}
                    aria-hidden
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
