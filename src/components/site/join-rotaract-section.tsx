import Link from "next/link";
import { JOIN_ROTARACT } from "@/lib/site-content";

export function JoinRotaractSection() {
  return (
    <section className="border-y border-zinc-200 bg-white py-10 sm:py-12 lg:py-14">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-2 lg:px-8">
        <div className="depth-card rounded-2xl border border-zinc-200 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Existing Member
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-zinc-900">
            {JOIN_ROTARACT.rotaractorTitle}
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-600">{JOIN_ROTARACT.rotaractorText}</p>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:bg-accent/90"
          >
            Sign in to portal
          </Link>
        </div>
        <div className="depth-card rounded-2xl border border-zinc-200 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            New to Rotaract
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold text-zinc-900">
            {JOIN_ROTARACT.joinTitle}
          </h2>
          <p className="mt-4 leading-relaxed text-zinc-600">{JOIN_ROTARACT.joinText}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/clubs"
              className="inline-flex rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-800 hover:border-accent hover:text-accent"
            >
              Find a club by zone
            </Link>
            <Link
              href="/contact"
              className="inline-flex rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Contact district team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
