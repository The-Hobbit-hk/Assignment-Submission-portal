import Link from "next/link";
import { CouncilHierarchyMembers } from "@/components/site/council-hierarchy-members";
import {
  getCouncilByGroup,
  type CouncilGroupSlug,
} from "@/lib/council-roster-data";
import { COUNCIL_PAGES } from "@/lib/site-content";
import { cn } from "@/lib/utils";

const HIERARCHY: {
  slug: CouncilGroupSlug;
  accentTitle?: boolean;
  layout: "hero" | "grid";
}[] = [
  { slug: "drr", accentTitle: true, layout: "hero" },
  { slug: "core-council", layout: "grid" },
  { slug: "sub-core", layout: "grid" },
  { slug: "district-executive-council", layout: "grid" },
  { slug: "event-chairperson", layout: "grid" },
  { slug: "convenors", layout: "grid" },
];

function CouncilHierarchySection({
  slug,
  accentTitle = false,
  layout,
  isFirst,
}: {
  slug: CouncilGroupSlug;
  accentTitle?: boolean;
  layout: "hero" | "grid";
  isFirst?: boolean;
}) {
  const page = COUNCIL_PAGES[slug];
  const members = getCouncilByGroup(slug);
  if (!page || members.length === 0) return null;

  return (
    <section
      id={slug}
      className={cn(
        "scroll-mt-site-header px-4 py-14 sm:px-6 sm:py-16 lg:px-8",
        !isFirst && "border-t border-zinc-200"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <h2
          className={cn(
            "text-center font-display text-2xl font-bold sm:text-3xl",
            accentTitle ? "text-accent" : "text-zinc-900"
          )}
        >
          {page.title.replace(/\s*\(DRR\)\s*/i, "")}
        </h2>

        <CouncilHierarchyMembers members={members} layout={layout} />
      </div>
    </section>
  );
}

function CouncilSectionNav({ groups }: { groups: CouncilGroupSlug[] }) {
  const items = HIERARCHY.filter((item) => groups.includes(item.slug));

  if (items.length <= 1) return null;

  return (
    <nav
      aria-label="Council sections"
      className="sticky-below-header z-20 border-b border-zinc-200 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2.5 sm:justify-center sm:px-6 lg:px-8">
        {items.map((item) => {
          const page = COUNCIL_PAGES[item.slug];
          if (!page) return null;
          const short =
            item.slug === "drr"
              ? "DRR"
              : item.slug === "district-executive-council"
                ? "Executive"
                : page.title.replace(/^District /, "").split(" ")[0];

          return (
            <a
              key={item.slug}
              href={`#${item.slug}`}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-accent/10 hover:text-accent sm:text-sm"
            >
              {short}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export function CouncilHierarchyView({
  groups,
  showNav = true,
}: {
  /** When omitted, renders the full district hierarchy. */
  groups?: CouncilGroupSlug[];
  showNav?: boolean;
}) {
  const activeGroups = groups ?? HIERARCHY.map((item) => item.slug);
  const sections = HIERARCHY.filter((item) => activeGroups.includes(item.slug));

  return (
    <div className="bg-white">
      {showNav && <CouncilSectionNav groups={activeGroups} />}
      {sections.map((section, index) => (
        <CouncilHierarchySection
          key={section.slug}
          slug={section.slug}
          accentTitle={section.accentTitle}
          layout={section.layout}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
}

export function CouncilHierarchyIntro({
  title,
  subtitle,
  backHref,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
}) {
  return (
    <header className="border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white px-4 py-10 text-center sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
          RIY 2026-27 · REIGN
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-zinc-900 sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            {subtitle}
          </p>
        )}
        {backHref && (
          <Link
            href={backHref}
            className="mt-6 inline-flex text-sm font-medium text-accent transition hover:text-accent/80"
          >
            ← View full council hierarchy
          </Link>
        )}
      </div>
    </header>
  );
}
