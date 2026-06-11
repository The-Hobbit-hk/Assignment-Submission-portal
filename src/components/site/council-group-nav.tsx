import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteReveal } from "@/components/site/site-reveal";
import { councilAvatarGradient, councilInitials } from "@/lib/council-display";
import {
  COUNCIL_USERS,
  getCouncilByGroup,
  type CouncilGroupSlug,
} from "@/lib/council-roster-data";
import { COUNCIL_PAGES } from "@/lib/site-content";

const GROUP_ORDER: CouncilGroupSlug[] = [
  "drr",
  "core-council",
  "sub-core",
  "district-executive-council",
  "event-chairperson",
  "convenors",
];

export function CouncilGroupNav() {
  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <SiteReveal>
          <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Meet the council
          </p>
          <h2 className="mt-3 text-center font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
            Six teams, one district vision
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-zinc-600">
            Explore each council group — from the DRR to convenors — and discover
            who leads your portfolio.
          </p>
        </SiteReveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GROUP_ORDER.map((slug, index) => {
            const page = COUNCIL_PAGES[slug];
            if (!page) return null;
            const members = getCouncilByGroup(slug);
            const preview = members.slice(0, 4);

            return (
              <SiteReveal key={slug} delay={index * 70}>
                <Link
                  href={`/council/${slug}`}
                  className="group depth-card depth-card-interactive flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition hover:border-accent/35"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-zinc-900 transition group-hover:text-accent">
                        {page.title}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-zinc-500">
                        {members.length} member{members.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-600">
                    {page.paragraphs[0]}
                  </p>

                  <div className="mt-5 flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {preview.map((member) => (
                        <span
                          key={member.email}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm"
                          style={{ background: councilAvatarGradient(member.email) }}
                          title={member.name}
                        >
                          {councilInitials(member.name)}
                        </span>
                      ))}
                      {members.length > preview.length && (
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-zinc-100 text-[10px] font-semibold text-zinc-600">
                          +{members.length - preview.length}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-zinc-400">View roster</span>
                  </div>
                </Link>
              </SiteReveal>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-500">
          {COUNCIL_USERS.length} council leaders across Rotaract District 3131 · RIY 2026-27
        </p>
      </div>
    </section>
  );
}
