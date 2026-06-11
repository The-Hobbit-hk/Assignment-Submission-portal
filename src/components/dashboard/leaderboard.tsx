import Link from "next/link";
import { Medal, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/dashboard";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

const RANK_META = [
  {
    label: "1st",
    title: "Gold",
    accent: "rank-accent-gold",
    medal: "text-amber-400",
    ring: "ring-amber-400/30",
  },
  {
    label: "2nd",
    title: "Silver",
    accent: "rank-accent-silver",
    medal: "text-slate-400",
    ring: "ring-slate-300/40",
  },
  {
    label: "3rd",
    title: "Bronze",
    accent: "rank-accent-bronze",
    medal: "text-amber-700",
    ring: "ring-amber-700/25",
  },
] as const;

function LeaderboardRow({ entry }: { entry: LeaderboardEntry }) {
  const meta = RANK_META[entry.rank - 1];
  const initials = entry.name
    .replace(/^Rtr\.\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/dashboard/members/${entry.memberId}`}
      className={cn(
        "depth-card-interactive group flex items-center gap-3 rounded-xl border border-border/40 p-3 sm:p-3.5",
        meta?.accent
      )}
    >
      <div className="flex w-10 shrink-0 flex-col items-center gap-0.5">
        <Medal className={cn("h-5 w-5", meta?.medal ?? "text-muted-foreground")} />
        <span className="text-[10px] font-bold uppercase text-muted-foreground">
          {meta?.label ?? `#${entry.rank}`}
        </span>
      </div>

      <Avatar
        className={cn(
          "h-11 w-11 border-2 border-white shadow-md",
          meta?.ring ?? "ring-border/40"
        )}
      >
        <AvatarImage src={entry.avatar ?? undefined} />
        <AvatarFallback className="bg-muted text-xs font-semibold">{initials}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-accent">
          {entry.name.startsWith("Rtr.") ? entry.name : `Rtr. ${entry.name}`}
        </p>
        <p className="truncate text-xs text-muted-foreground">{entry.clubName}</p>
      </div>

      <div className="shrink-0 rounded-lg bg-accent/10 px-2.5 py-1.5 text-right">
        <p className="text-sm font-bold text-accent">{entry.points}</p>
        <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
          pts
        </p>
      </div>
    </Link>
  );
}

export function Leaderboard({ entries }: LeaderboardProps) {
  const top3 = entries.slice(0, 3);

  return (
    <div className="dashboard-panel h-full">
      <div className="dashboard-panel-header">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 shadow-sm">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Leaderboard
            </p>
            <p className="text-sm font-semibold text-foreground">Top performers</p>
          </div>
        </div>
        <Link
          href="/dashboard/council-scores"
          className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent/15"
        >
          View all
        </Link>
      </div>

      <div className="space-y-2.5 p-4 sm:p-5">
        {top3.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-12 text-center">
            <Trophy className="mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No rankings yet</p>
          </div>
        ) : (
          top3.map((entry) => <LeaderboardRow key={entry.memberId} entry={entry} />)
        )}
      </div>
    </div>
  );
}
