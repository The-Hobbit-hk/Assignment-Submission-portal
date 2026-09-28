import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/page-hero";
import { RESOURCE_PAGES } from "@/lib/site-content";

export function generateStaticParams() {
  return Object.keys(RESOURCE_PAGES).map((slug) => ({ slug }));
}

export default async function ResourceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resource = RESOURCE_PAGES[slug];
  if (!resource) notFound();

  return (
    <>
      <PageHero title={resource.title} />
      <section className="py-8 sm:py-10">
        <div className="mx-auto max-w-3xl space-y-6 px-4 lg:px-8">
          <p className="leading-relaxed text-zinc-600">{resource.description}</p>
          {resource.coverImage && resource.externalUrl ? (
            <a
              href={resource.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mx-auto block max-w-sm overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <img
                src={resource.coverImage}
                alt={`${resource.title} cover. Opens the directory.`}
                className="w-full transition duration-300 group-hover:scale-[1.02]"
              />
            </a>
          ) : (
            resource.externalUrl && (
              <a
                href={resource.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
              >
                Download / View asset
              </a>
            )
          )}
          <Link href="/resources" className="block text-sm text-accent hover:underline">
            ← Back to all resources
          </Link>
        </div>
      </section>
    </>
  );
}
