import Link from "next/link";
import { CouncilPortrait } from "@/components/site/council-portrait";
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
        !isFirst && "border-t border-white/10"
      )}
    >
      <div className="mx-auto max-w-6xl">
        <h2
          className={cn(
            "text-center font-display text-2xl font-bold sm:text-3xl",
            accentTitle ? "text-amber-500" : "text-white"
          )}
        >
          {page.title.replace(/\s*\(DRR\)\s*/i, "")}
        </h2>

        {layout === "hero" ? (
          <div className="mt-10 flex justify-center sm:mt-12">
            <CouncilPortrait member={members[0]} size="hero" />
          </div>
        ) : (
          <div className="mt-10 flex flex-wrap justify-center gap-x-5 gap-y-10 sm:mt-12 sm:gap-x-7 sm:gap-y-12">
            {members.map((member) => (
              <CouncilPortrait key={member.email} member={member} />
            ))}
          </div>
        )}
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
      className="sticky-below-header z-20 border-b border-white/10 bg-zinc-950/95 backdrop-blur-md"
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
              className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white sm:text-sm"
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
    <div className="bg-zinc-950">
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
    <header className="border-b border-white/10 bg-zinc-950 px-4 py-10 text-center sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500/90">
          RIY 2026-27 · REIGN
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            {subtitle}
          </p>
        )}
        {backHref && (
          <Link
            href={backHref}
            className="mt-6 inline-flex text-sm font-medium text-amber-500/90 transition hover:text-amber-400"
          >
            ← View full council hierarchy
          </Link>
        )}
      </div>
    </header>
  );
}
