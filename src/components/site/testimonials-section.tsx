"use client";

import Image from "next/image";
import { useState } from "react";
import { Quote } from "lucide-react";
import { DISTRICT_TESTIMONIALS } from "@/lib/site-content";

const CLAMP_CHARS = 280;

function TestimonialCard({
  quote,
  name,
  role,
  club,
  photo,
}: (typeof DISTRICT_TESTIMONIALS)[number]) {
  const [expanded, setExpanded] = useState(false);
  const isLong = quote.length > CLAMP_CHARS;
  const displayQuote =
    expanded || !isLong ? quote : `${quote.slice(0, CLAMP_CHARS).trim()}…`;

  return (
    <figure className="depth-card flex h-full flex-col rounded-2xl border border-zinc-200/80 bg-white p-6">
      <div className="flex items-start gap-4">
        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-accent/20 bg-zinc-100">
          <Image
            src={photo}
            alt={name}
            fill
            sizes="80px"
            className="object-cover object-top"
          />
        </div>
        <figcaption className="min-w-0 pt-0.5">
          <p className="font-semibold leading-snug text-zinc-900">{name}</p>
          <p className="mt-1 text-xs font-medium leading-snug text-accent">{role}</p>
          <p className="mt-1 text-xs leading-snug text-zinc-500">{club}</p>
        </figcaption>
      </div>

      <Quote className="mt-5 h-7 w-7 text-accent/25" aria-hidden />
      <blockquote className="mt-3 flex-1 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
        &ldquo;{displayQuote}&rdquo;
      </blockquote>

      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 self-start text-xs font-semibold text-accent hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </figure>
  );
}

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
            <TestimonialCard key={item.name} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}
