import Image from "next/image";
import { ExternalLink, HeartHandshake } from "lucide-react";
import { VENT_OUT_2_ME } from "@/lib/site-content";

export function VentOutSection() {
  return (
    <section
      id="vent-out-2-me"
      aria-labelledby="vent-out-heading"
      className="border-y border-emerald-900/10 bg-[#f4f7f2] py-12 sm:py-14"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-12 lg:px-8">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4f6b4a]">
            {VENT_OUT_2_ME.badge}
          </p>
          <h2
            id="vent-out-heading"
            className="mt-3 font-display text-3xl font-bold text-[#2f3f2c] sm:text-4xl"
          >
            {VENT_OUT_2_ME.title}
          </h2>
          <div className="relative mt-6 h-44 w-44 sm:h-52 sm:w-52">
            <Image
              src={VENT_OUT_2_ME.logo}
              alt="Vent Out 2 Me logo"
              fill
              sizes="208px"
              className="object-contain"
            />
          </div>
          <a
            href={VENT_OUT_2_ME.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4f6b4a] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f563b]"
          >
            Visit ventout2.me
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
          <p className="mt-4 max-w-sm text-sm text-[#4f6b4a]/VENT_OUT_2_ME.closing}</p>
        </div>

        <div className="space-y-5">
          <p className="text-base leading-relaxed text-zinc-700">{VENT_OUT_2_ME.intro}</p>
          <p className="text-sm leading-relaxed text-zinc-600">{VENT_OUT_2_ME.body}</p>
          <p className="text-sm leading-relaxed text-zinc-600">{VENT_OUT_2_ME.support}</p>

          <div className="rounded-2xl border border-emerald-900/10 bg-white/80 p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-[#4f6b4a]" aria-hidden />
              <div>
                <h3 className="font-semibold text-zinc-900">{VENT_OUT_2_ME.stepsHeading}</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-zinc-600">
                  {VENT_OUT_2_ME.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                <p className="mt-4 rounded-xl bg-[#eef3ea] px-3 py-2 text-sm text-[#2f3f2c]">
                  Referral code:{" "}
                  <span className="font-semibold tracking-wide">
                    {VENT_OUT_2_ME.referralCode}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
