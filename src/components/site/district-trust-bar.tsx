import { DISTRICT_PUBLIC_STATS } from "@/config/district-public";
import { cn } from "@/lib/utils";

export function DistrictTrustBar({
  variant = "light",
  className,
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const dark = variant === "dark";

  return (
    <div
      className={cn(
        "border-t",
        dark
          ? "border-white/10 bg-zinc-950/85 backdrop-blur-md"
          : "border-zinc-200 bg-white",
        className
      )}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-4 lg:px-8">
        {DISTRICT_PUBLIC_STATS.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "px-4 py-4 text-center sm:px-6 sm:py-5",
              dark ? "text-white" : "text-zinc-900"
            )}
          >
            <p
              className={cn(
                "font-display text-2xl font-bold sm:text-3xl",
                dark ? "text-white" : "text-zinc-900"
              )}
            >
              {stat.value}
            </p>
            <p
              className={cn(
                "mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] sm:text-xs",
                dark ? "text-zinc-400" : "text-zinc-500"
              )}
            >
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
