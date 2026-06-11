import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { COUNCIL_PAGES } from "@/lib/site-content";

export default function CouncilPage() {
  return (
    <>
      <PageHero title="Council 25-26" subtitle="District leadership for RIY 2025-26" />
      <section className="py-16">
        <div className="mx-auto grid max-w-4xl gap-4 px-4 sm:grid-cols-2 lg:px-8">
          {Object.entries(COUNCIL_PAGES).map(([slug, page]) => (
            <Link
              key={slug}
              href={`/council/${slug}`}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-accent/40"
            >
              <h2 className="font-semibold text-zinc-900">{page.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-600">{page.paragraphs[0]}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
