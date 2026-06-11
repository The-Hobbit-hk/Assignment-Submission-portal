import Link from "next/link";
import {
  CalendarDays,
  FileText,
  Landmark,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { HomeHero } from "@/components/site/home-hero";
import { JoinRotaractSection } from "@/components/site/join-rotaract-section";
import { SiteReveal } from "@/components/site/site-reveal";
import { SiteSectionHeader } from "@/components/site/site-section-header";
import { SponsorshipPreview } from "@/components/site/sponsorship-preview";
import { DISTRICT_PILLARS } from "@/config/district-public";
import { PORTAL_OPTIONS } from "@/config/portals";
import { siteConfig } from "@/config/site";

const QUICK_LINKS = [
  {
    href: "/clubs",
    label: "Clubs",
    description: "101 clubs across Pune & Raigad by zone",
    icon: Users,
  },
  {
    href: "/calendar",
    label: "Calendar",
    description: "District events and club installations",
    icon: CalendarDays,
  },
  {
    href: "/council",
    label: "Council",
    description: "District leadership for RIY 2026-27",
    icon: Landmark,
  },
  {
    href: "/resources",
    label: "Resources",
    description: "Handbooks, policies, and official documents",
    icon: FileText,
  },
] as const;

export function HomePage() {
  return (
    <>
      <HomeHero />

      <SiteReveal>
        <section className="py-10 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <SiteSectionHeader
              eyebrow="District at a glance"
              title="Young leaders. Structured governance. Lasting impact."
              description={`${siteConfig.organization} ${siteConfig.district} is the official youth wing network under Rotary International — uniting clubs, council, and district operations across Pune and Raigad.`}
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group depth-card depth-card-interactive rounded-2xl border border-zinc-200/80 p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-white">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-zinc-900 group-hover:text-accent">
                    {item.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </SiteReveal>

      <SiteReveal delay={60}>
        <section className="border-y border-zinc-200 bg-zinc-50 py-10 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <div className="depth-card rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10">
                <BrandLogo variant="full" size="lg" linked={false} />
                <p className="mt-8 leading-relaxed text-zinc-600">
                  Empowering young leaders through fellowship, service, and professional
                  development across {siteConfig.organization} {siteConfig.district} — governed
                  through council oversight, bluebook accountability, and transparent district
                  reporting.
                </p>
                <Link
                  href="/about"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
                >
                  Read our district story
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <div>
                <SiteSectionHeader
                  align="left"
                  eyebrow="What we stand for"
                  title="Built on Rotary values"
                  description="Every club, council portfolio, and district initiative is anchored in service above self."
                />
                <ul className="mt-8 space-y-4">
                  {DISTRICT_PILLARS.map((pillar) => (
                    <li
                      key={pillar.title}
                      className="rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm"
                    >
                      <h3 className="font-display text-lg font-bold text-zinc-900">{pillar.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                        {pillar.description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </SiteReveal>

      <SiteReveal delay={100}>
        <JoinRotaractSection />
      </SiteReveal>

      <SiteReveal delay={140}>
        <SponsorshipPreview />
      </SiteReveal>

      <SiteReveal delay={180}>
        <section className="border-t border-zinc-200 bg-white py-10 sm:py-12 lg:py-14">
          <div className="mx-auto max-w-6xl px-4 lg:px-8">
            <SiteSectionHeader
              eyebrow="Member access"
              title="Secure district portals"
              description="Authorized club officers and council members sign in to reporting, bluebook, events, and district operations."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PORTAL_OPTIONS.map((portal) => (
                <Link
                  key={portal.id}
                  href={`/login?portal=${portal.id}`}
                  className="depth-card depth-card-interactive rounded-xl border border-zinc-200 p-5 hover:border-accent/30"
                >
                  <h3 className="font-semibold text-accent">{portal.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{portal.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </SiteReveal>
    </>
  );
}
