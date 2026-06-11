import { notFound } from "next/navigation";
import { ContentPageView } from "@/components/site/content-page";
import { ABOUT_PAGES } from "@/lib/site-content";

export function generateStaticParams() {
  return Object.keys(ABOUT_PAGES).map((slug) => ({ slug }));
}

export default async function AboutSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const content = ABOUT_PAGES[slug];
  if (!content) notFound();
  return <ContentPageView content={content} />;
}
