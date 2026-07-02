import Image from "next/image";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SiteReveal } from "@/components/site/site-reveal";
import { siteConfig } from "@/config/site";
import { ABOUT_PAGES, ABOUT_SECTION_ORDER, type ContentPage } from "@/lib/site-content";
import { cn } from "@/lib/utils";

function AboutSectionBlock({ id, content }: { id: string; content: ContentPage }) {
  const hasImage = Boolean(content.image);
  const showLogo = !hasImage && id === "rotaract-district-3131";

  return (
    <article
      id={id}
      className="scroll-mt-site-header border-t border-zinc-200 pt-12 first:border-t-0 first:pt-0 sm:pt-14"
    >
      <div
        className={cn(
          "grid gap-8 sm:gap-10",
          (hasImage || showLogo) && "lg:grid-cols-2 lg:items-start"
        )}
      >
        {(hasImage || showLogo) && (
          <div className="flex justify-center lg:sticky lg:sticky-below-header">
            {hasImage && content.image ? (
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
              <div className="flex min-h-[360px] w-full max-w-md flex-col items-center justify-center gap-6 rounded-2xl border border-zinc-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-8 text-center shadow-sm">
                <BrandLogo variant="full" size="lg" linked={false} className="w-full max-w-[320px]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                    RIY {siteConfig.rotaryYear} · {siteConfig.theme}
                  </p>
                  <p className="mx-auto mt-2 max-w-xs text-xs leading-relaxed text-zinc-500">
                    {siteConfig.themeTagline}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {["101 Clubs", "2,700+ Rotaractors", "Pune & Raigad"].map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 sm:space-y-5">
          {content.badge && (
            <span className="inline-block rounded-full bg-gradient-to-r from-sky-500 to-pink-500 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
              {content.badge}
            </span>
          )}
          <h2 className="font-display text-2xl font-bold text-zinc-900 sm:text-3xl">{content.title}</h2>
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="leading-relaxed text-zinc-600">
              {paragraph}
            </p>
          ))}
          {content.signatory && (
            <p className="pt-1 font-medium text-accent">{content.signatory}</p>
          )}
        </div>
      </div>
    </article>
  );
}

export function AboutSections() {
  return (
    <SiteReveal>
      <section className="py-8 sm:py-10 lg:py-12">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="space-y-12 sm:space-y-14">
            {ABOUT_SECTION_ORDER.map((slug) => (
              <AboutSectionBlock key={slug} id={slug} content={ABOUT_PAGES[slug]} />
            ))}
          </div>
        </div>
      </section>
    </SiteReveal>
  );
}
