import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DistrictTrustBar } from "@/components/site/district-trust-bar";
import { JoinRotaractSection } from "@/components/site/join-rotaract-section";
import { PageHero } from "@/components/site/page-hero";
import { SiteReveal } from "@/components/site/site-reveal";
import { SponsorshipPreview } from "@/components/site/sponsorship-preview";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { siteConfig } from "@/config/site";

export function HomePage() {
  return (
    <>
      <PageHero
        title="Rotaract District 3131"
        subtitle="REIGN — Rotaract Empowering Individuals for Growth and Networking · RIY 2026-27"
        trustLine="Official district website · A program of Rotary International · 101 clubs across Pune & Raigad"
        backgroundImage={siteConfig.homeHeroBackground}
        large
      />

      <DistrictTrustBar variant="light" />

      <SiteReveal>
        <section className="py-10 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-6xl px-4 text-center lg:px-8">
            <h2 className="bg-gradient-to-r from-amber-600 via-amber-500 to-rose-600 bg-clip-text font-display text-3xl font-bold text-transparent md:text-4xl">
              About us
            </h2>
            <div className="depth-card relative mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl p-8">
              <BrandLogo variant="full" size="lg" linked={false} className="mx-auto" />
              <p className="mx-auto mt-8 max-w-2xl text-zinc-600">
                Empowering young leaders through fellowship, service, and professional
                development across {siteConfig.organization} {siteConfig.district}.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-500">
                Led by DRR {siteConfig.drr} · Governed through district council, bluebook
                accountability, and transparent reporting for RIY {siteConfig.rotaryYear}.
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
