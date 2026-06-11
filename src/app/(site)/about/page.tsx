import { BrandLogo } from "@/components/brand/brand-logo";
import { PageHero } from "@/components/site/page-hero";
import { ABOUT_PAGES } from "@/lib/site-content";

export default function AboutPage() {
  const district = ABOUT_PAGES["rotaract-district-3131"];

  return (
    <>
      <PageHero title="About us" />
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
            <div className="flex min-h-[280px] items-center justify-center p-12">
              <BrandLogo variant="full" size="lg" linked={false} />
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-3xl space-y-6">
            {district.paragraphs.map((p) => (
              <p key={p.slice(0, 48)} className="leading-relaxed text-zinc-600">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
