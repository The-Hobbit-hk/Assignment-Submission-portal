"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PORTAL_OPTIONS } from "@/config/portals";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Portals", href: "#portals" },
  { label: "Events", href: "#events" },
  { label: "Contact", href: "#contact-us" },
];

const TESTIMONIALS = [
  {
    quote:
      "Being a president, it's an experience to gain. Rotaract gives us so much opportunity to build networks and serve communities that matter.",
    author: "Rtr. Club President",
  },
  {
    quote:
      "Before joining Rotaract, I had no idea how Rotaract worked. My very first event — Lumora — showed me the power of district-level collaboration.",
    author: "Rtr. District Member",
  },
  {
    quote:
      "Under our PDI we conducted professional development sessions in schools. Rotaract District 3131 gave us the platform to lead with purpose.",
    author: "Rtr. Council Member",
  },
];

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-lg">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 lg:px-8">
          <BrandLogo variant="full" size="nav" priority />

          <nav className="hidden items-center gap-8 text-sm text-white/80 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition hover:text-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-accent/90 sm:inline-flex"
            >
              Login
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "border-t border-white/10 bg-black lg:hidden",
            mobileOpen ? "block" : "hidden"
          )}
        >
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm text-white/80 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full bg-accent px-5 py-2.5 text-center text-sm font-medium text-white"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <section
        id="home"
        className="relative flex min-h-screen items-center justify-center px-4 pb-16 pt-28"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(217, 30, 92, 0.15), transparent 60%), radial-gradient(ellipse at bottom, #111 0%, #000 70%)",
          }}
        />
        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
          <BrandLogo variant="full" size="hero" linked={false} priority />
          <p className="max-w-lg text-base leading-relaxed text-white/65 md:text-lg">
            Empowering young leaders through fellowship, service, and professional
            development across Rotary International District 3131.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white transition hover:bg-accent/90"
            >
              Sign In
            </Link>
            <a
              href="#portals"
              className="rounded-full border border-white/25 px-8 py-3 text-sm font-medium text-white/90 transition hover:border-accent/50 hover:text-white"
            >
              View Portals
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="border-t border-white/10 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2 lg:px-8">
          <div className="flex justify-center lg:justify-start">
            <BrandLogo variant="full" size="lg" linked={false} />
          </div>
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              About Us
            </p>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              {siteConfig.district}
            </h2>
            <p className="leading-relaxed text-white/70">
              {siteConfig.organization} {siteConfig.district} is a dynamic organization
              working with Rotary International District 3131 to empower young leaders
              through fellowship, professional development, and community service.
            </p>
            <p className="text-sm text-white/45">DRR · RIY 2025-26 · RID 3131</p>
          </div>
        </div>
      </section>

      <section id="portals" className="border-t border-white/10 bg-zinc-950/80 py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Member Access
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Access Your Portal
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/55">
              Choose your role to sign in, or use general login for any district account.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PORTAL_OPTIONS.map((portal) => (
              <Link
                key={portal.id}
                href={`/login?portal=${portal.id}`}
                className="group rounded-xl border border-white/10 bg-black/40 p-5 transition hover:border-accent/40 hover:bg-white/[0.03]"
              >
                <h3 className="font-semibold text-accent">{portal.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {portal.description}
                </p>
                <p className="mt-4 text-xs text-white/35 group-hover:text-accent/80">
                  Sign in →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <h2 className="mb-10 text-center font-display text-3xl font-bold">
            Testimonials
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.author}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-6"
              >
                <p className="text-sm leading-relaxed text-white/70">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 text-xs font-medium text-accent">{t.author}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="events" className="sr-only" aria-hidden />
      <section id="contact-us" className="sr-only" aria-hidden />

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        © {new Date().getFullYear()} {siteConfig.organization} {siteConfig.district}. All rights reserved.
      </footer>
    </div>
  );
}
