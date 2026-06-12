import Link from "next/link";
import { Medal, Trophy } from "lucide-react";
import { useCitationStandings } from "@/hooks/use-citations";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const RANK_META = [
  { medal: "text-amber-400", ring: "ring-amber-400/30", accent: "rank-accent-gold" },
  { medal: "text-slate-400", ring: "ring-slate-300/40", accent: "rank-accent-silver" },
  { medal: "text-amber-700", ring: "ring-amber-700/25", accent: "rank-accent-bronze" },
] as const;

export function CitationStandingsWidget({ limit = 5 }: { limit?: number }) {
  const now = new Date();
  const { data, isLoading } = useCitationStandings({
    cadence: "MONTHLY",
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    limit,
  });

  const top = data?.standings.slice(0, limit) ?? [];

  return (
    <div className="dashboard-panel h-full">
      <div className="dashboard-panel-header">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 shadow-sm">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Citations
            </p>
            <p className="text-sm font-semibold text-foreground">Club standings</p>
          </div>
        </div>
        <Link
          href="/dashboard/citations/standings"
          className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent/15"
        >
          View all
        </Link>
      </div>

      <div className="space-y-2.5 p-4 sm:p-5">
        {isLoading ? (
          <Skeleton className="h-40 rounded-xl" />
        ) : top.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-12 text-center">
            <Trophy className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No citation points yet</p>
          </div>
        ) : (
          top.map((entry) => {
            const meta = RANK_META[entry.rank - 1];
            return (
              <div
                key={entry.clubId}
                className={cn(
                  "depth-card flex items-center gap-3 rounded-xl border border-border/40 p-3 sm:p-3.5",
                  meta?.accent
                )}
              >
                <div className="flex w-10 shrink-0 flex-col items-center gap-0.5">
                  <Medal className={cn("h-5 w-5", meta?.medal ?? "text-muted-foreground")} />
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    #{entry.rank}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{entry.clubName}</p>
                  {entry.zone && (
                    <p className="truncate text-xs text-muted-foreground">{entry.zone}</p>
                  )}
                </div>
                <div className="shrink-0 rounded-lg bg-accent/10 px-2.5 py-1.5 text-right">
                  <p className="text-sm font-bold text-accent">{entry.totalPoints}</p>
                  <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                    pts
                  </p>
                </div>
              </div>
            );
          })
        )}
        {data?.periodLabel && (
          <p className="text-center text-[10px] text-muted-foreground">
            {data.periodLabel} · RIY {siteConfig.rotaryYear}
          </p>
        )}
      </div>
    </div>
  );
}
