import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ANNUAL_SPONSORS, SPONSORSHIP } from "@/lib/site-content";

const GOLD_PARTNERS = ANNUAL_SPONSORS.filter((s) => s.tier === "Gold Partner").slice(0, 2);

export function SponsorshipPreview() {
  return (
    <section id="sponsorship" className="py-8 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Sponsorship
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
                {SPONSORSHIP.title}
              </h2>
              <p className="mt-2 max-w-lg text-sm text-zinc-600">{SPONSORSHIP.homeTeaser}</p>
            </div>

            <Link
              href="/sponsorship"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:self-center"
            >
              View packages
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-200 pt-5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Proud partners
            </span>
            {GOLD_PARTNERS.length > 0 ? (
              <>
                {GOLD_PARTNERS.map((sponsor) => (
                  <span
                    key={sponsor.name}
                    className="rounded-full border border-amber-200/80 bg-amber-50/60 px-3 py-1 text-xs font-semibold text-amber-900"
                  >
                    {sponsor.name}
                  </span>
                ))}
                <Link
                  href="/sponsorship"
                  className="text-xs font-medium text-accent hover:underline"
                >
                  See all partners
                </Link>
              </>
            ) : (
              <span className="rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent">
                Coming soon
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
