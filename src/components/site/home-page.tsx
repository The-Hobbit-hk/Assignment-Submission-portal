import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DistrictTrustBar } from "@/components/site/district-trust-bar";
import { JoinRotaractSection } from "@/components/site/join-rotaract-section";
import { PageHero } from "@/components/site/page-hero";
import { SiteReveal } from "@/components/site/site-reveal";
import { SponsorshipPreview } from "@/components/site/sponsorship-preview";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { siteConfig } from "@/config/site";
import { DISTRICT_OFFICIAL_CLUB_COUNT } from "@/lib/district-clubs-data";

export function HomePage() {
  return (
    <>
      <PageHero
        title="Rotaract District 3131"
        subtitle="REIGN — Rotaract Empowering Individuals for Growth and Networking · RIY 2026-27"
        trustLine={`Official district website · A program of Rotary International · ${DISTRICT_OFFICIAL_CLUB_COUNT} clubs across Pune & Raigad`}
        backgroundImage={siteConfig.homeHeroBackground}
        large
      />

      <div className="relative z-10 px-4 lg:px-8">
        <div className="mx-auto -mt-6 max-w-4xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg sm:-mt-8">
          <DistrictTrustBar variant="light" className="border-t-0" />
        </div>
      </div>

      <SiteReveal>
        <section className="py-10 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-6xl px-4 text-center lg:px-8">
            <h2 className="bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 bg-clip-text text-center font-display text-3xl font-bold text-transparent md:text-4xl">
              About us
            </h2>
            <div className="depth-card relative mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl p-8 text-center">
              <div className="flex justify-center">
                <BrandLogo variant="full" size="lg" linked={false} />
              </div>
              <p className="mx-auto mt-8 max-w-2xl text-zinc-600">
                Empowering young leaders through fellowship, service, and professional
                development across {siteConfig.organization} {siteConfig.district}.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-500">
                Led by DRR {siteConfig.drr} ·  {siteConfig.rotaryYear}.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-block text-sm font-medium text-accent hover:underline"
              >
                Learn more about us →
              </Link>
            </div>
          </div>
        </section>
      </SiteReveal>

      <SiteReveal delay={80}>
        <JoinRotaractSection />
      </SiteReveal>

      <SiteReveal delay={120}>
        <SponsorshipPreview />
      </SiteReveal>

      <SiteReveal delay={160}>
        <TestimonialsSection />
      </SiteReveal>
    </>
  );
}
