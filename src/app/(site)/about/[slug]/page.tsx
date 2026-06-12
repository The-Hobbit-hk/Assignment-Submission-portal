import { notFound, redirect } from "next/navigation";
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
  if (!ABOUT_PAGES[slug]) notFound();
  redirect(`/about#${slug}`);
}
