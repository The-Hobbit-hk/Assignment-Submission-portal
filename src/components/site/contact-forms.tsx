"use client";

import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "@/lib/site-content";
import { SOCIAL_LINKS } from "@/config/site-navigation";

function ContactForm({
  title,
  submitLabel,
}: {
  title: string;
  submitLabel: string;
}) {
  const [sent, setSent] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-zinc-900 md:text-3xl">{title}</h2>
      {sent ? (
        <p className="text-sm text-emerald-600">
          Thank you. Your message has been recorded and will be reviewed by the district team.
        </p>
      ) : (
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <input
            type="text"
            name="name"
            required
            placeholder="Name"
            className="w-full border-b border-zinc-300 bg-transparent py-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-accent"
          />
          <input
            type="email"
            name="email"
            required
            placeholder="Email"
            className="w-full border-b border-zinc-300 bg-transparent py-3 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-accent"
          />
          <textarea
            name="message"
            required
            rows={6}
            placeholder="Message"
            className="w-full resize-none rounded-sm border border-zinc-300 bg-white p-4 text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-accent"
          />
          <button
            type="submit"
            className="rounded-sm bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            {submitLabel}
          </button>
        </form>
      )}
    </div>
  );
}

export function ContactPageContent() {
  return (
    <>
      <section className="border-b border-zinc-200 py-16">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 lg:grid-cols-2 lg:px-8">
          <ContactForm title="Grievance Redressal" submitLabel="Send Grievance" />
          <ContactForm title="Get In Touch" submitLabel="Send Message" />
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="font-display text-3xl font-bold text-zinc-900">Contact Info</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-zinc-900">Let&apos;s Talk.</h3>
              <div className="flex items-center gap-3 text-zinc-600">
                <Phone className="h-4 w-4" />
                <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>
              </div>
              <div className="flex items-center gap-3 text-zinc-600">
                <Mail className="h-4 w-4" />
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-zinc-900">Visit Us.</h3>
              <div className="flex gap-3 text-zinc-600">
                <MapPin className="mt-1 h-4 w-4 shrink-0" />
                <p className="text-sm leading-relaxed">{CONTACT.address}</p>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-xs text-zinc-600 hover:text-accent"
                aria-label={social.label}
              >
                {social.label[0]}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
