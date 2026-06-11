import Link from "next/link";
import { BrandLogo } from "@/components/brand/brand-logo";
import { DistrictTrustBar } from "@/components/site/district-trust-bar";
import { JoinRotaractSection } from "@/components/site/join-rotaract-section";
import { PageHero } from "@/components/site/page-hero";
import { SiteReveal } from "@/components/site/site-reveal";
import { SponsorshipPreview } from "@/components/site/sponsorship-preview";
import { PORTAL_OPTIONS } from "@/config/portals";
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
        <section className="border-t border-zinc-200 bg-zinc-50 py-10 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Member Access
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
                Access Your Portal
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PORTAL_OPTIONS.map((portal) => (
                <Link
                  key={portal.id}
                  href={`/login?portal=${portal.id}`}
                  className="depth-card depth-card-interactive rounded-xl p-5 hover:border-accent/30"
                >
                  <h3 className="font-semibold text-accent">{portal.title}</h3>
                  <p className="mt-2 text-sm text-zinc-600">{portal.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </SiteReveal>
    </>
  );
}
