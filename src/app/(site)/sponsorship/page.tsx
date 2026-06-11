import Link from "next/link";
import { AnnualSponsorsSection } from "@/components/site/annual-sponsors-section";
import { PageHero } from "@/components/site/page-hero";
import { SPONSORSHIP, CONTACT } from "@/lib/site-content";

export default function SponsorshipPage() {
  return (
    <>
      <PageHero title="Sponsorship" subtitle={SPONSORSHIP.intro} />
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <AnnualSponsorsSection />

          <div className="mt-14 border-t border-zinc-200 pt-12">
            <div className="mb-8 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Partnership packages
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
                Sponsorship slabs
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600">
                Join our annual sponsors with a package tailored to your brand visibility goals.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {SPONSORSHIP.tiers.map((tier) => (
                <div
                  key={tier.name}
                  className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="font-display text-xl font-bold text-accent">{tier.name}</h3>
                  <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                    {tier.benefits.map((benefit) => (
                      <li key={benefit}>• {benefit}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 text-center">
            <h3 className="font-display text-2xl font-bold text-zinc-900">
              Become a district partner
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-zinc-600">
              Reach {CONTACT.email} or call {CONTACT.phone} to discuss sponsorship packages
              tailored to your brand.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
