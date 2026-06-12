import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnnualSponsorsSection } from "@/components/site/annual-sponsors-section";
import { SponsorshipTierCards } from "@/components/site/sponsorship-tier-cards";
import { SponsorshipValueStrip } from "@/components/site/sponsorship-value-strip";
import { SPONSORSHIP } from "@/lib/site-content";

export function SponsorshipPreview() {
  return (
    <section id="sponsorship" className="py-12 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-8 shadow-sm md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Sponsorship
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-zinc-900 md:text-4xl">
            {SPONSORSHIP.title}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-zinc-600">{SPONSORSHIP.intro}</p>

          <div className="mt-8">
            <SponsorshipValueStrip />
          </div>

          <div className="mt-10">
            <AnnualSponsorsSection compact />
          </div>

          <div className="mt-10 border-t border-zinc-200 pt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Partnership packages
            </p>
            <p className="mt-2 max-w-xl text-sm text-zinc-600">
              From premier Gold visibility to Community recognition — find the slab that fits your
              brand.
            </p>
            <div className="mt-6">
              <SponsorshipTierCards compact />
            </div>
          </div>

          <Link
            href="/sponsorship"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Explore sponsorship opportunities
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
