"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, Search } from "lucide-react";
import { SiteReveal } from "@/components/site/site-reveal";
import { Input } from "@/components/ui/input";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_META,
  type ResourceCategory,
} from "@/lib/resources-meta";
import { RESOURCE_PAGES } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const CATEGORY_GRADIENT: Record<Exclude<ResourceCategory, "All">, string> = {
  Handbooks: "from-rose-500/15 via-rose-50 to-white",
  Governance: "from-indigo-500/15 via-indigo-50 to-white",
  District: "from-amber-500/15 via-amber-50 to-white",
  Brand: "from-violet-500/15 via-violet-50 to-white",
};

export function ResourcesExplorer() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ResourceCategory>("All");

  const items = useMemo(() => {
    return Object.entries(RESOURCE_PAGES).map(([slug, resource]) => {
      const meta = RESOURCE_META[slug];
      return { slug, resource, meta };
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(({ slug, resource, meta }) => {
      const matchesCategory =
        category === "All" || meta?.category === category;
      const matchesQuery =
        !q ||
        resource.title.toLowerCase().includes(q) ||
        resource.description.toLowerCase().includes(q) ||
        slug.replace(/-/g, " ").includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [items, query, category]);

  return (
    <section className="border-t border-zinc-200 bg-gradient-to-b from-zinc-50 to-white py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <SiteReveal>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                District knowledge hub
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
                Browse, search, and open resources
              </h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-600">
                Handbooks, governance docs, calendars, and brand assets — filter by topic or
                search to find what you need fast.
              </p>
            </div>
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                type="search"
                placeholder="Search resources…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
                aria-label="Search resources"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {RESOURCE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  category === cat
                    ? "border-accent bg-accent text-white shadow-sm"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-accent/30 hover:text-accent"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </SiteReveal>

        {filtered.length === 0 ? (
          <p className="mt-10 text-center text-sm text-zinc-500">No resources match your filters.</p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ slug, resource, meta }, index) => {
              const Icon = meta?.icon;
              const cat = meta?.category ?? "District";
              const gradient = CATEGORY_GRADIENT[cat];
              const isExternal = Boolean(resource.externalUrl);
              const href = isExternal ? resource.externalUrl! : `/resources/${slug}`;

              const card = (
                <article
                  className={cn(
                    "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br p-5 transition duration-300",
                    gradient,
                    "hover:-translate-y-1 hover:border-accent/35 hover:shadow-lg hover:shadow-accent/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/80 text-accent shadow-sm ring-1 ring-zinc-200/80 transition group-hover:bg-accent group-hover:text-white">
                      {Icon ? <Icon className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 ring-1 ring-zinc-200/60">
                      {cat}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-lg font-bold text-zinc-900 transition group-hover:text-accent">
                    {resource.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-600">
                    {resource.description}
                  </p>

                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                    {isExternal ? "Open asset" : "Read more"}
                    {isExternal ? (
                      <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                  </span>

                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-accent/5 transition duration-500 group-hover:scale-150" />
                </article>
              );

              return (
                <SiteReveal key={slug} delay={Math.min(index * 50, 300)}>
                  {isExternal ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full"
                    >
                      {card}
                    </a>
                  ) : (
                    <Link href={href} className="block h-full">
                      {card}
                    </Link>
                  )}
                </SiteReveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
