import { Mail, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { SocialIcon } from "@/components/site/social-links";
import { SOCIAL_LINKS } from "@/config/site-navigation";
import { CONTACT } from "@/lib/site-content";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:gap-12 lg:grid-cols-2 lg:px-8">
        <div className="space-y-8">
          <h2 className="font-display text-2xl font-bold text-zinc-900">Contact Us</h2>

          <div className="flex gap-4">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-zinc-400" />
            <div>
              <p className="font-semibold text-zinc-900">Official Address</p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">{CONTACT.address}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Mail className="mt-1 h-5 w-5 shrink-0 text-zinc-400" />
            <div>
              <p className="font-semibold text-zinc-900">Email Us</p>
              <a
                href={`mailto:${CONTACT.drrEmail}`}
                className="mt-1 block text-sm text-zinc-600 hover:text-accent"
              >
                {CONTACT.drrEmail}
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <Phone className="mt-1 h-5 w-5 shrink-0 text-zinc-400" />
            <div>
              <p className="font-semibold text-zinc-900">Call Us</p>
              <a
                href={`tel:${CONTACT.phone}`}
                className="mt-1 block text-sm text-zinc-600 hover:text-accent"
              >
                {CONTACT.phone}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <BrandLogo variant="full" size="lg" linked={false} />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition hover:border-accent hover:bg-accent/5 hover:text-accent"
                aria-label={social.label}
              >
                <SocialIcon label={social.label} className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="mt-8 text-sm font-semibold tracking-wider text-zinc-800">
            ROTARACT DISTRICT 3131
          </p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-500">
            Official website of Rotaract District 3131 — a program of Rotary International.
            Serving Rotaract clubs across Pune and Raigad, India.
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            © {new Date().getFullYear()} Rotaract District 3131. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
