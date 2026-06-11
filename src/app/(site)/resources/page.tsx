import Link from "next/link";
import { PageHero } from "@/components/site/page-hero";
import { RESOURCE_PAGES } from "@/lib/site-content";

export default function ResourcesPage() {
  return (
    <>
      <PageHero title="Useful Resources" subtitle="Official district documents and references" />
      <section className="py-16">
        <div className="mx-auto grid max-w-4xl gap-4 px-4 lg:px-8">
          {Object.entries(RESOURCE_PAGES).map(([slug, resource]) => (
            <Link
              key={slug}
              href={`/resources/${slug}`}
              className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-accent/40"
            >
              <h2 className="font-semibold text-zinc-900">{resource.title}</h2>
              <p className="mt-2 text-sm text-zinc-600">{resource.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
