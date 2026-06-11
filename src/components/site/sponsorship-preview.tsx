import Link from "next/link";
import { SPONSORSHIP } from "@/lib/site-content";

export function SponsorshipPreview() {
  return (
    <section id="sponsorship" className="py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="rounded-2xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-8 shadow-sm md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Sponsorship
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold text-zinc-900 md:text-4xl">
            {SPONSORSHIP.title}
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-zinc-600">{SPONSORSHIP.intro}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {SPONSORSHIP.tiers.map((tier) => (
              <div
                key={tier.name}
                className="rounded-xl border border-zinc-200 bg-white p-4"
              >
                <h3 className="font-semibold text-accent">{tier.name}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-zinc-600">
                  {tier.benefits.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link
            href="/sponsorship"
            className="mt-8 inline-flex rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Explore sponsorship opportunities →
          </Link>
        </div>
      </div>
    </section>
  );
}
