import { Quote } from "lucide-react";
import { DISTRICT_TESTIMONIALS } from "@/lib/site-content";

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

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DISTRICT_TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="depth-card flex h-full flex-col rounded-2xl border border-zinc-200/80 bg-white p-6"
            >
              <Quote className="h-8 w-8 text-accent/25" aria-hidden />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-zinc-700">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-zinc-100 pt-4">
                <p className="font-semibold text-zinc-900">{item.name}</p>
                <p className="mt-0.5 text-xs font-medium text-accent">{item.role}</p>
                <p className="mt-1 text-xs text-zinc-500">{item.club}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
