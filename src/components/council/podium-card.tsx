import { Crown, Medal, TrendingDown, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const RANK_META = [
  {
    label: "1st",
    title: "Gold",
    accent: "rank-accent-gold",
    medal: "text-amber-400",
    ring: "ring-amber-400/40",
    badge: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
    glow: "shadow-amber-200/50",
  },
  {
    label: "2nd",
    title: "Silver",
    accent: "rank-accent-silver",
    medal: "text-slate-400",
    ring: "ring-slate-300/50",
    badge: "bg-gradient-to-r from-slate-400 to-slate-500 text-white",
    glow: "shadow-slate-200/40",
  },
  {
    label: "3rd",
    title: "Bronze",
    accent: "rank-accent-bronze",
    medal: "text-amber-700",
    ring: "ring-amber-700/30",
    badge: "bg-gradient-to-r from-amber-700 to-amber-800 text-white",
    glow: "shadow-amber-900/20",
  },
] as const;

interface PodiumCardProps {
  rank: number;
  name: string;
  score: number;
  clubName?: string | null;
  avatar?: string | null;
  trendDirection?: string;
  featured?: boolean;
  className?: string;
}

function memberInitials(name: string) {
  return name
    .replace(/^(Rtr\.|PHF\.|DRR\.|PDRR\.)\s*/gi, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function PodiumCard({
  rank,
  name,
  score,
  clubName,
  avatar,
  trendDirection,
  featured = false,
  className,
}: PodiumCardProps) {
  const meta = RANK_META[rank - 1];
  const displayName = name.match(/^(Rtr\.|PHF\.)/i) ? name : `Rtr. ${name}`;
  const trendingUp = trendDirection === "up";
  const trendingDown = trendDirection === "down";

  return (
    <div
      className={cn(
        "depth-card relative flex flex-col overflow-hidden rounded-2xl border border-border/50 transition",
        meta?.accent,
        featured && "md:-translate-y-2 md:shadow-lg",
        featured && meta?.glow,
        className
      )}
    >
      {featured && (
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-400/15 blur-2xl" />
      )}

      <div className="relative flex items-start justify-between gap-2 p-4 pb-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            meta?.badge ?? "bg-muted text-muted-foreground"
          )}
        >
          {featured && <Crown className="h-3 w-3" aria-hidden />}
          #{rank} · {meta?.title ?? "Rank"}
        </span>
        <Medal className={cn("h-6 w-6 shrink-0", meta?.medal ?? "text-muted-foreground")} />
      </div>

      <div className="relative flex flex-1 flex-col items-center px-4 pb-5 pt-1 text-center">
        <Avatar
          className={cn(
            "border-2 border-white shadow-md",
            featured ? "h-20 w-20" : "h-16 w-16",
            meta?.ring ?? "ring-border/40"
          )}
        >
          <AvatarImage src={avatar ?? undefined} />
          <AvatarFallback className="bg-accent/10 text-sm font-semibold text-accent">
            {memberInitials(name)}
          </AvatarFallback>
        </Avatar>

        <p
          className={cn(
            "mt-3 line-clamp-2 font-semibold leading-snug text-foreground",
            featured ? "text-base" : "text-sm"
          )}
        >
          {displayName}
        </p>
        {clubName && (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{clubName}</p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <div className="rounded-xl bg-accent/10 px-4 py-2">
            <p className={cn("font-bold text-accent", featured ? "text-2xl" : "text-xl")}>
              {score}
            </p>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
              points
            </p>
          </div>
          {trendingUp && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            </span>
          )}
          {trendingDown && (
            <span className="flex items-center gap-0.5 text-xs font-medium text-rose-500">
              <TrendingDown className="h-3.5 w-3.5" aria-hidden />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
