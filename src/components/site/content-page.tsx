import Image from "next/image";
import { BrandLogo } from "@/components/brand/brand-logo";
import { PageHero } from "@/components/site/page-hero";
import { SiteReveal } from "@/components/site/site-reveal";
import type { ContentPage } from "@/lib/site-content";

export function ContentPageView({ content, heroTitle }: { content: ContentPage; heroTitle?: string }) {
  return (
    <>
      <PageHero title={heroTitle ?? content.title} />
      <SiteReveal>
      <section className="py-10 sm:py-14 lg:py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-start">
            <div className="flex justify-center lg:sticky lg:sticky-below-header">
              {content.image ? (
                <div
                  className={
                    content.image.containerClassName ??
                    "relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-xl border border-zinc-200"
                  }
                >
                  <Image
                    src={content.image.src}
                    alt={content.image.alt}
                    fill
                    className={content.image.className ?? "object-cover"}
                  />
                </div>
              ) : (
                <BrandLogo variant="full" size="lg" linked={false} />
              )}
            </div>
            <div className="space-y-6">
              {content.badge && (
                <span className="inline-block rounded-full bg-gradient-to-r from-sky-500 to-pink-500 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  {content.badge}
                </span>
              )}
              <h2 className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl md:text-4xl">
                {content.title}
              </h2>
              {content.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="leading-relaxed text-zinc-600">
                  {paragraph}
                </p>
              ))}
              {content.signatory && (
                <p className="pt-2 font-medium text-accent">{content.signatory}</p>
              )}
            </div>
          </div>
        </div>
      </section>
      </SiteReveal>
    </>
  );
}
