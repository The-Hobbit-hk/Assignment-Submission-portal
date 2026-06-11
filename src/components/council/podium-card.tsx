import { Medal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const RANK_LABELS = ["First Rank", "Second Rank", "Third Rank"] as const;
const MEDAL_COLORS = ["text-gray-300", "text-yellow-400", "text-amber-600"] as const;

interface PodiumCardProps {
  rank: number;
  name: string;
  score: number;
  avatar?: string | null;
  className?: string;
}

export function PodiumCard({ rank, name, score, avatar, className }: PodiumCardProps) {
  const idx = rank - 1;
  const initials = name
    .replace(/^Rtr\.\s*/i, "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-border/50 bg-card/80 p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="rounded-md bg-muted/60 px-2 py-1 text-xs text-muted-foreground">
          #{rank} {RANK_LABELS[idx] ?? "Rank"}
        </span>
        <Medal className={cn("h-5 w-5", MEDAL_COLORS[idx] ?? "text-muted-foreground")} />
      </div>
      <div className="my-3 border-t border-border/40" />
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 border border-border/40">
          <AvatarImage src={avatar ?? undefined} />
          <AvatarFallback className="bg-muted text-sm">{initials}</AvatarFallback>
        </Avatar>
        <p className="flex-1 text-sm font-medium leading-snug">
          {name.startsWith("Rtr.") ? name : `Rtr. ${name}`}
        </p>
      </div>
      <p className="mt-4 text-right text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{score}</span> Points Earned
      </p>
    </div>
  );
}
