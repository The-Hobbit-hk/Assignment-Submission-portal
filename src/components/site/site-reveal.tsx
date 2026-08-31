"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function SiteReveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setVisible(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px 10% 0px" }
    );

    observer.observe(node);

    // IntersectionObserver can miss content that is already on screen after hydration.
    const checkInView = () => {
      const rect = node.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      if (rect.top < viewportHeight && rect.bottom > 0) reveal();
    };

    checkInView();
    requestAnimationFrame(checkInView);
    const fallback = window.setTimeout(checkInView, 150);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn("site-scroll-reveal", visible && "site-scroll-reveal-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
