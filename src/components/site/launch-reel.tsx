"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Handshake,
  Maximize2,
  RotateCcw,
  Search,
  SkipForward,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Duration of every scene, in order. */
const SCENE_MS = [
  3000, // 0 logo
  3200, // 1 REIGN
  3200, // 2 stats
  2600, // 3 tour intro
  3600, // 4 clubs
  3600, // 5 events + calendar
  3600, // 6 council
  3400, // 7 resources
  3400, // 8 reporting portal
  3200, // 9 leadership
  3000, // 10 launch
  4200, // 11 CTA
] as const;
const TOTAL_MS = SCENE_MS.reduce((a, b) => a + b, 0);

const STATS = [
  { value: "101", label: "Clubs" },
  { value: "2,700+", label: "Rotaractors" },
  { value: "2", label: "Zones · Pune & Raigad" },
] as const;

const NAV = ["Home", "About", "Clubs", "Events", "Calendar", "Council", "Contact"] as const;

const CLUB_ROWS = [
  { name: "Pune Shaniwarwada", zone: "Zone 1" },
  { name: "Bavdhan Pioneers", zone: "Zone 3" },
  { name: "Aundh Smartcity", zone: "Zone 2" },
  { name: "Vibrants", zone: "Zone 4" },
] as const;

const EVENTS = [
  { title: "District Installation", date: "Jul 12", tag: "Upcoming" },
  { title: "REIGN Learning Series", date: "Aug 03", tag: "Registrations open" },
  { title: "District Sports Meet", date: "Sep 21", tag: "Coming soon" },
] as const;

const RESOURCES = [
  "Rotaract Handbook",
  "Awards Structure 26-27",
  "District Calendar",
  "Logo Resources",
  "Manual of Procedure",
  "Directory",
] as const;

function BrowserFrame({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  return (
    <div className="launch-frame mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-white/12 bg-[#0d0c12] shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <div className="ml-2 flex-1 truncate rounded-md bg-black/40 px-3 py-1 text-left text-[10px] text-white/50 sm:text-xs">
          rotaractdistrict3131.org{path}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function MiniNav({ active }: { active: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-white/8 pb-3">
      <Image src={siteConfig.logo} alt="" width={90} height={34} className="h-6 w-auto" aria-hidden />
      <div className="ml-auto flex flex-wrap gap-2">
        {NAV.map((item) => (
          <span
            key={item}
            className={cn(
              "text-[10px] font-medium sm:text-[11px]",
              item === active ? "text-accent" : "text-white/45"
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LaunchReel() {
  const [scene, setScene] = useState(0);
  const [finished, setFinished] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    setScene(0);
    setFinished(false);
    setProgress(0);
    startRef.current = null;
  }, []);

  const skip = useCallback(() => {
    setFinished(true);
    setProgress(100);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (finished) return;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;

      setProgress(Math.min(100, (elapsed / TOTAL_MS) * 100));

      let accumulated = 0;
      let nextScene = SCENE_MS.length - 1;
      for (let i = 0; i < SCENE_MS.length; i++) {
        accumulated += SCENE_MS[i];
        if (elapsed < accumulated) {
          nextScene = i;
          break;
        }
      }
      setScene(nextScene);

      if (elapsed >= TOTAL_MS) {
        setFinished(true);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [finished]);

  async function enterFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      // Fullscreen may be blocked until user gesture — ignore.
    }
  }

  const isActive = (i: number) => scene === i && !finished;

  return (
    <div className="launch-reel relative flex min-h-dvh flex-col overflow-hidden bg-[#07060a] text-white">
      <div className="launch-reel-grain pointer-events-none absolute inset-0 opacity-[0.18]" />
      <div className="launch-reel-glow pointer-events-none absolute inset-0" />

      <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50 sm:text-xs">
          Launch film · RIY {siteConfig.rotaryYear}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="launch-reel-control"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={enterFullscreen}
            className="launch-reel-control"
            aria-label="Enter fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
          {!finished && (
            <button type="button" onClick={skip} className="launch-reel-control" aria-label="Skip">
              <SkipForward className="h-4 w-4" />
            </button>
          )}
          {finished && (
            <button type="button" onClick={reset} className="launch-reel-control" aria-label="Replay">
              <RotateCcw className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 pb-8 pt-2">
        <div className="launch-reel-stage relative aspect-[3/4] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl shadow-accent/10 sm:aspect-[4/3] lg:aspect-video">
          <Image
            src={siteConfig.homeHeroBackground}
            alt=""
            fill
            priority
            className={cn(
              "object-cover transition duration-[1.4s] ease-out",
              scene >= 1 ? "scale-105 opacity-25" : "scale-110 opacity-20"
            )}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/80" />

          {/* Scene 0 — Logo reveal */}
          <div className={cn("launch-reel-scene absolute inset-0 flex flex-col items-center justify-center px-6 text-center", isActive(0) && "launch-reel-scene-active")}>
            <div className="launch-reel-logo-wrap">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={320}
                height={120}
                priority
                className="h-auto w-[min(72vw,280px)] object-contain drop-shadow-2xl"
              />
            </div>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.22em] text-white/70 sm:text-base">
              {siteConfig.district}
            </p>
          </div>

          {/* Scene 1 — REIGN theme */}
          <div className={cn("launch-reel-scene absolute inset-0 flex flex-col items-center justify-center px-6 text-center", isActive(1) && "launch-reel-scene-active")}>
            <Image
              src={siteConfig.reignLogo}
              alt={`${siteConfig.theme} theme`}
              width={280}
              height={140}
              className="h-auto w-[min(64vw,240px)] object-contain"
            />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-rose-200/90 sm:text-base">
              {siteConfig.themeTagline}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
              Rotary International Year {siteConfig.rotaryYear}
            </p>
          </div>

          {/* Scene 2 — District scale */}
          <div className={cn("launch-reel-scene absolute inset-0 flex flex-col items-center justify-center px-6", isActive(2) && "launch-reel-scene-active")}>
            <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              One district · Infinite impact
            </p>
            <div className="grid w-full max-w-lg grid-cols-3 gap-3 sm:gap-4">
              {STATS.map((stat, i) => (
                <div
                  key={stat.label}
                  className="launch-reel-stat rounded-xl border border-white/10 bg-white/5 px-2 py-4 text-center backdrop-blur-sm"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <p className="font-display text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-[10px] leading-tight text-white/65 sm:text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scene 3 — Tour intro */}
          <div className={cn("launch-reel-scene absolute inset-0 flex flex-col items-center justify-center px-6 text-center", isActive(3) && "launch-reel-scene-active")}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">Take a tour</p>
            <h2 className="mt-4 font-display text-2xl font-bold sm:text-4xl">Everything, in one place</h2>
            <p className="mt-3 max-w-md text-sm text-white/65 sm:text-base">
              Clubs · Events · Calendar · Council · Resources · Reporting
            </p>
          </div>

          {/* Scene 4 — Clubs */}
          <div className={cn("launch-reel-scene absolute inset-0 flex items-center justify-center px-4 sm:px-8", isActive(4) && "launch-reel-scene-active")}>
            <div className="w-full">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">
                <Users className="mr-1 inline h-3.5 w-3.5" /> Find your club
              </p>
              <BrowserFrame path="/clubs">
                <MiniNav active="Clubs" />
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                  <Search className="h-3.5 w-3.5 text-white/40" />
                  <span className="text-[11px] text-white/40">Search clubs by name, city…</span>
                  <span className="ml-auto rounded-md bg-accent/20 px-2 py-0.5 text-[10px] text-accent">
                    Filter by zone
                  </span>
                </div>
                <div className="space-y-2">
                  {CLUB_ROWS.map((c, i) => (
                    <div
                      key={c.name}
                      className="launch-reel-stat flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2"
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/20 text-[10px] font-bold text-accent">
                        RC
                      </span>
                      <span className="text-[11px] font-medium text-white/85 sm:text-xs">
                        Rotaract Club of {c.name}
                      </span>
                      <span className="ml-auto text-[10px] text-white/40">{c.zone}</span>
                    </div>
                  ))}
                </div>
              </BrowserFrame>
            </div>
          </div>

          {/* Scene 5 — Events + Calendar */}
          <div className={cn("launch-reel-scene absolute inset-0 flex items-center justify-center px-4 sm:px-8", isActive(5) && "launch-reel-scene-active")}>
            <div className="w-full">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">
                <CalendarDays className="mr-1 inline h-3.5 w-3.5" /> Events &amp; calendar
              </p>
              <BrowserFrame path="/events">
                <MiniNav active="Events" />
                <div className="space-y-2">
                  {EVENTS.map((e, i) => (
                    <div
                      key={e.title}
                      className="launch-reel-stat flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2.5"
                      style={{ animationDelay: `${i * 110}ms` }}
                    >
                      <div className="flex h-9 w-9 flex-col items-center justify-center rounded-md bg-accent/15 text-accent">
                        <span className="text-[9px] leading-none">{e.date.split(" ")[0]}</span>
                        <span className="text-sm font-bold leading-none">{e.date.split(" ")[1]}</span>
                      </div>
                      <span className="text-[11px] font-medium text-white/85 sm:text-xs">{e.title}</span>
                      <span className="ml-auto rounded-full bg-white/10 px-2 py-0.5 text-[9px] text-white/70">
                        {e.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </BrowserFrame>
            </div>
          </div>

          {/* Scene 6 — Council */}
          <div className={cn("launch-reel-scene absolute inset-0 flex items-center justify-center px-4 sm:px-8", isActive(6) && "launch-reel-scene-active")}>
            <div className="w-full">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">
                Meet the District Council 26-27
              </p>
              <BrowserFrame path="/council">
                <MiniNav active="Council" />
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {[
                    "karishma-awari",
                    "harshvardhan-kale",
                    "aishwarya-patil",
                    "disha-daga",
                    "hamid-shaikh",
                    "sharvindu-jogdand",
                    "rohan-puri",
                    "samrudhi-khade",
                    "aslam-dhanani",
                    "ishan-malawade",
                    "faizan-tamboli",
                    "sanjana-pawar",
                  ].map((slug, i) => (
                    <div
                      key={slug}
                      className="launch-reel-stat overflow-hidden rounded-lg border border-white/10"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <div className="relative aspect-square w-full bg-white/5">
                        <Image
                          src={`/council/${slug}.png`}
                          alt=""
                          fill
                          className="object-cover object-top"
                          aria-hidden
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </BrowserFrame>
            </div>
          </div>

          {/* Scene 7 — Resources */}
          <div className={cn("launch-reel-scene absolute inset-0 flex items-center justify-center px-4 sm:px-8", isActive(7) && "launch-reel-scene-active")}>
            <div className="w-full">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">
                Useful resources &amp; downloads
              </p>
              <BrowserFrame path="/resources">
                <MiniNav active="Home" />
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {RESOURCES.map((r, i) => (
                    <div
                      key={r}
                      className="launch-reel-stat rounded-lg border border-white/8 bg-white/[0.03] px-3 py-3 text-[11px] text-white/80"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className="mb-1 block h-1 w-6 rounded-full bg-accent/60" />
                      {r}
                    </div>
                  ))}
                </div>
              </BrowserFrame>
            </div>
          </div>

          {/* Scene 8 — Reporting portal */}
          <div className={cn("launch-reel-scene absolute inset-0 flex items-center justify-center px-4 sm:px-8", isActive(8) && "launch-reel-scene-active")}>
            <div className="w-full">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.26em] text-accent">
                Club &amp; council reporting portal
              </p>
              <BrowserFrame path="/dashboard">
                <div className="mb-3 flex items-center gap-2">
                  <Image src={siteConfig.logo} alt="" width={80} height={30} className="h-5 w-auto" aria-hidden />
                  <span className="ml-auto rounded-md bg-emerald-500/15 px-2 py-0.5 text-[9px] text-emerald-300">
                    Secure login
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { k: "Members", v: "Manage" },
                    { k: "Events", v: "Report" },
                    { k: "Bluebook", v: "Submit" },
                    { k: "Scores", v: "Live" },
                    { k: "Citations", v: "Track" },
                    { k: "Profile", v: "Edit" },
                  ].map((tile, i) => (
                    <div
                      key={tile.k}
                      className="launch-reel-stat rounded-lg border border-white/8 bg-white/[0.03] px-2 py-3 text-center"
                      style={{ animationDelay: `${i * 70}ms` }}
                    >
                      <p className="text-[11px] font-semibold text-white/85">{tile.k}</p>
                      <p className="text-[9px] text-accent">{tile.v}</p>
                    </div>
                  ))}
                </div>
              </BrowserFrame>
            </div>
          </div>

          {/* Scene 9 — Leadership */}
          <div className={cn("launch-reel-scene absolute inset-0 flex flex-col items-center justify-center px-8 text-center", isActive(9) && "launch-reel-scene-active")}>
            <div className="launch-reel-stat relative mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-accent/40">
              <Image src="/council/karishma-awari.png" alt="" fill className="object-cover object-top" aria-hidden />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/50">Led by</p>
            <p className="mt-2 font-display text-2xl font-bold text-white sm:text-4xl">DRR {siteConfig.drr}</p>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-zinc-300 sm:text-base">
              {siteConfig.description}
            </p>
          </div>

          {/* Scene 10 — Website launch */}
          <div className={cn("launch-reel-scene absolute inset-0 flex flex-col items-center justify-center px-6 text-center", isActive(10) && "launch-reel-scene-active")}>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">We are live</p>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">Official Website Launch</h2>
            <p className="mt-4 text-sm text-white/70 sm:text-base">rotaractdistrict3131.org</p>
          </div>

          {/* Scene 11 / End — CTA */}
          <div className={cn("launch-reel-scene absolute inset-0 flex flex-col items-center justify-center px-6 text-center", (scene === 11 || finished) && "launch-reel-scene-active")}>
            <Image
              src={siteConfig.logo}
              alt=""
              width={200}
              height={80}
              className="mb-5 h-auto w-40 opacity-95"
              aria-hidden
            />
            <p className="font-display text-xl font-bold sm:text-2xl">Explore your district home</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[11px] text-white/60">
              <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Clubs</span>
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> Calendar</span>
              <span className="inline-flex items-center gap-1"><Handshake className="h-3 w-3" /> Sponsorship</span>
            </div>
            <Link
              href="/"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/30 transition hover:brightness-110"
            >
              Explore the website
            </Link>
          </div>
        </div>

        <div className="mt-6 w-full max-w-4xl">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent via-rose-400 to-indigo-400 transition-[width] duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-center text-[11px] text-white/45">
            Tip: tap fullscreen and screen-record this page for your Instagram / WhatsApp launch post.
          </p>
        </div>
      </div>
    </div>
  );
}
