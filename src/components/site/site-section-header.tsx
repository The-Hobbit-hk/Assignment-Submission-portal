import { cn } from "@/lib/utils";

export function SiteSectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl text-left",
        className
      )}
    >
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      )}
      <h2
        className={cn(
          "font-display font-bold text-zinc-900",
          eyebrow ? "mt-2" : "",
          align === "center" ? "text-2xl sm:text-3xl md:text-4xl" : "text-xl sm:text-2xl md:text-3xl"
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base">{description}</p>
      )}
    </div>
  );
}
