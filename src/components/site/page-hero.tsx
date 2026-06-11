import Image from "next/image";
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
        "page-hero-section relative flex justify-center overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-zinc-50 to-white",
        large
          ? backgroundImage
            ? "min-h-[48vh] items-center pt-site-header sm:min-h-[56vh] lg:min-h-[64vh]"
            : "min-h-[40vh] items-center pt-site-header sm:min-h-[48vh] lg:min-h-[56vh]"
          : "items-start",
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
            className="object-cover object-[center_28%] opacity-[0.52] sm:object-[center_32%]"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/38 via-white/46 to-white/55" />
        </>
      ) : (
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(217, 30, 92, 0.08), transparent 60%)",
          }}
        />
      )}
      <div className="site-hero-orb site-hero-orb-left pointer-events-none absolute left-[8%] top-[22%] h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
      <div className="site-hero-orb site-hero-orb-right pointer-events-none absolute right-[10%] top-[30%] h-32 w-32 rounded-full bg-indigo-400/10 blur-3xl" />

      <div
        className={cn(
          "relative z-10 mx-auto max-w-4xl rounded-2xl px-4 text-center lg:px-8",
          backgroundImage &&
            large &&
            "depth-panel mx-4 max-w-3xl bg-white/55 px-6 py-8 backdrop-blur-sm sm:mx-auto sm:px-10",
          backgroundImage && large
            ? "py-10 pb-16 sm:py-12 sm:pb-20 lg:py-16 lg:pb-24"
            : "py-5 pb-6 sm:py-6 sm:pb-7"
        )}
      >
        <p className="site-hero-eyebrow mb-2 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent shadow-sm backdrop-blur-sm sm:text-xs">
          <span className="site-hero-dot h-1.5 w-1.5 rounded-full bg-accent" />
          Rotaract District 3131
        </p>
        <h1
          className={cn(
            "site-hero-title font-display font-bold text-zinc-900",
            large
              ? "text-3xl sm:text-4xl md:text-6xl lg:text-7xl"
              : "text-2xl sm:text-3xl md:text-4xl"
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="site-hero-subtitle mx-auto mt-2 max-w-2xl text-base text-zinc-700 md:text-lg">
            {subtitle}
          </p>
        )}
        <div className="site-hero-line mx-auto mt-4 h-0.5 w-16 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent sm:mt-5 sm:w-24" />
      </div>
    </section>
  );
}
