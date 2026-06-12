import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import { AnnualSponsorsSection } from "@/components/site/annual-sponsors-section";
import { PageHero } from "@/components/site/page-hero";
import { SiteReveal } from "@/components/site/site-reveal";
import { SponsorshipTierCards } from "@/components/site/sponsorship-tier-cards";
import { SponsorshipValueStrip } from "@/components/site/sponsorship-value-strip";
import { SPONSORSHIP, CONTACT } from "@/lib/site-content";

export default function SponsorshipPage() {
  return (
    <>
      <PageHero title="Sponsorship" subtitle={SPONSORSHIP.intro} />
      <section className="py-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <SiteReveal>
            <SponsorshipValueStrip />
          </SiteReveal>

          <SiteReveal delay={80} className="mt-12 sm:mt-14">
            <AnnualSponsorsSection />
          </SiteReveal>

          <SiteReveal delay={120} className="mt-14 border-t border-zinc-200 pt-12 sm:mt-16">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Partnership packages
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
                Choose your visibility
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600">
                Whether you are a national brand or a local business, there is a package that puts
                your name in front of thousands of motivated young leaders — with measurable
                presence at district events and on our channels.
              </p>
            </div>

            <SponsorshipTierCards />
          </SiteReveal>

          <SiteReveal delay={160} className="mt-12 sm:mt-14">
            <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 p-8 text-center text-white sm:p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(217,30,92,0.18),transparent_50%)]" />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-300">
                  Ready to partner?
                </p>
                <h3 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
                  Put your brand beside youth leadership
                </h3>
                <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-300">
                  Limited partner slots for RIY 2026-27. Speak with the district team for a
                  customised proposal — logo placement, event presence, and digital features tailored
                  to your goals.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent/90"
                  >
                    Become a partner
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <a
                    href={`mailto:${CONTACT.email}?subject=Sponsorship%20enquiry%20%E2%80%94%20Rotaract%20District%203131`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    {CONTACT.email}
                  </a>
                </div>
                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  {CONTACT.phone}
                </p>
              </div>
            </div>
          </SiteReveal>
        </div>
      </section>
    </>
  );
}
