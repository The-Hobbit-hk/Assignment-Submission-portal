import { SPONSORSHIP } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export function SponsorshipValueStrip({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {SPONSORSHIP.valueProps.map((item) => (
        <div
          key={item.title}
          className="depth-card rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white to-zinc-50/80 p-5 text-center sm:text-left"
        >
          <p className="font-display text-3xl font-bold text-accent">{item.label}</p>
          <p className="mt-1 text-sm font-semibold text-zinc-900">{item.title}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}
