import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Shield } from "lucide-react";
import { DistrictTrustBar } from "@/components/site/district-trust-bar";
import { siteConfig } from "@/config/site";

export function HomeHero() {
  return (
    <section className="home-hero-section relative overflow-hidden border-b border-zinc-900/10">
      <Image
        src={siteConfig.homeHeroBackground}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/82 to-zinc-950/45" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-zinc-950/20" />

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-4 lg:px-8">
        <div className="py-10 sm:py-12 lg:py-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm sm:text-xs">
            <Shield className="h-3.5 w-3.5 text-rose-300" aria-hidden />
            Official District Website · Rotary International
          </div>

          <h1 className="site-hero-title mt-5 max-w-3xl font-display text-3xl font-bold leading-[1.08] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Rotaract District 3131
          </h1>

          <p className="site-hero-subtitle mt-4 max-w-2xl text-base leading-relaxed text-zinc-200 sm:text-lg">
            <span className="font-semibold text-white">{siteConfig.theme}</span>
            {" — "}
            {siteConfig.themeTagline}
            <span className="mt-1 block text-sm text-zinc-300 sm:text-base">
              Rotary Year {siteConfig.rotaryYear} · Led by DRR {siteConfig.drr}
            </span>
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/clubs"
              className="depth-btn-accent inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white"
            >
              Explore 101 clubs
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/council"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              District Council 26-27
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:text-white"
            >
              About the district
            </Link>
          </div>
        </div>

        <DistrictTrustBar variant="dark" className="-mx-4 rounded-none border-white/10 sm:-mx-0 sm:rounded-t-2xl" />
      </div>
    </section>
  );
}
