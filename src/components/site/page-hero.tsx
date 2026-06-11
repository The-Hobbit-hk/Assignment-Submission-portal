import { cn } from "@/lib/utils";

export function PageHero({
  title,
  subtitle,
  large = false,
  className,
}: {
  title: string;
  subtitle?: string;
  large?: boolean;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative flex items-center justify-center overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white",
        large ? "min-h-[70vh] pt-28" : "min-h-[14rem] pt-28",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(217, 30, 92, 0.08), transparent 60%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center lg:px-8">
        <h1
          className={cn(
            "font-display font-bold text-zinc-900",
            large ? "text-4xl md:text-6xl lg:text-7xl" : "text-3xl md:text-4xl"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-600 md:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
