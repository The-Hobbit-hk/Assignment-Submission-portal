import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  subtitle,
  large = false,
  backgroundImage,
  className,
}: {
  title: string;
  subtitle?: string;
  large?: boolean;
  backgroundImage?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "page-hero-section relative flex justify-center overflow-hidden border-b border-zinc-200",
        large
          ? backgroundImage
            ? "min-h-[48vh] items-center bg-zinc-950 pt-site-header sm:min-h-[56vh] lg:min-h-[64vh]"
            : "min-h-[40vh] items-center bg-gradient-to-b from-zinc-100 to-white pt-site-header sm:min-h-[48vh]"
          : "items-start bg-gradient-to-b from-zinc-100/70 via-zinc-50 to-white",
        className
      )}
    >
      {backgroundImage ? (
        <>
          <Image
            src={backgroundImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_30%] brightness-[0.72]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/70 to-zinc-950/50" />
        </>
      ) : (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 55% at 50% -10%, rgba(217, 30, 92, 0.07), transparent 55%)",
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
        </>
      )}

      {!backgroundImage && (
        <>
          <div className="site-hero-orb site-hero-orb-left pointer-events-none absolute left-[8%] top-[18%] h-20 w-20 rounded-full bg-accent/8 blur-2xl" />
          <div className="site-hero-orb site-hero-orb-right pointer-events-none absolute right-[10%] top-[24%] h-28 w-28 rounded-full bg-indigo-400/8 blur-3xl" />
        </>
      )}

      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-4xl px-4 text-center lg:px-8",
          backgroundImage && large
            ? "max-w-3xl py-10 sm:py-12 lg:py-14"
            : "py-5 pb-6 sm:py-6 sm:pb-7"
        )}
      >
        <p
          className={cn(
            "site-hero-eyebrow mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] shadow-sm backdrop-blur-sm sm:text-xs",
            backgroundImage && large
              ? "border border-white/20 bg-white/10 text-white/90"
              : "border border-accent/15 bg-white/80 text-accent"
          )}
        >
          <span
            className={cn(
              "site-hero-dot h-1.5 w-1.5 rounded-full",
              backgroundImage && large ? "bg-rose-300" : "bg-accent"
            )}
          />
          Official District · RIY {siteConfig.rotaryYear}
        </p>
        <h1
          className={cn(
            "site-hero-title font-display font-bold",
            backgroundImage && large ? "text-white" : "text-zinc-900",
            large
              ? "text-3xl sm:text-4xl md:text-5xl lg:text-6xl"
              : "text-2xl sm:text-3xl md:text-4xl"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              "site-hero-subtitle mx-auto mt-2 max-w-2xl text-base md:text-lg",
              backgroundImage && large ? "text-zinc-200" : "text-zinc-600"
            )}
          >
            {subtitle}
          </p>
        )}
        <div
          className={cn(
            "site-hero-line mx-auto mt-4 h-0.5 w-16 rounded-full sm:mt-5 sm:w-24",
            backgroundImage && large
              ? "bg-gradient-to-r from-transparent via-white/70 to-transparent"
              : "bg-gradient-to-r from-transparent via-accent to-transparent"
          )}
        />
      </div>
    </section>
  );
}
