import { Quote } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="border-t border-zinc-200 bg-zinc-50 py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Voices from the district
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-zinc-900 sm:text-3xl">
            What Rotaractors say
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-600">
            Leaders and members across Rotaract District 3131 share their experience
            serving clubs, council, and community.
          </p>
        </div>

        <div className="depth-card mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-zinc-200/80 bg-white px-6 py-14 text-center">
          <Quote className="h-10 w-10 text-accent/30" aria-hidden />
          <p className="mt-5 font-display text-xl font-bold text-zinc-900 sm:text-2xl">
            Coming soon
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600">
            We&apos;re collecting stories from Rotaractors across the district.
            Check back soon to hear their experiences.
          </p>
        </div>
      </div>
    </section>
  );
}
