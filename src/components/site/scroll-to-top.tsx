"use client";

import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="depth-float safe-bottom safe-right fixed z-40 flex h-10 w-10 items-center justify-center rounded-full border border-accent/20 bg-white text-accent hover:bg-accent/5"
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
