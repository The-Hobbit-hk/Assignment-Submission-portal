import { SOCIAL_LINKS } from "@/config/site-navigation";
import { cn } from "@/lib/utils";

function SocialIcon({ label, className }: { label: string; className?: string }) {
  switch (label) {
    case "Facebook":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M13 10h3l-.5 3H13v9h-3v-9H8v-3h2V9.5C10 6.5 11.5 5 14.5 5H16v3h-1.5c-1 0-1.5.5-1.5 1.5V10z" />
        </svg>
      );
    case "LinkedIn":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M6.5 8.5h3v11h-3v-11zm1.5-5a1.75 1.75 0 110 3.5 1.75 1.75 0 010-3.5zM10 8.5h2.9v1.5h.1c.4-.8 1.5-1.7 3.1-1.7 3.3 0 3.9 2.2 3.9 5v5.7h-3v-5c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5.1h-3V8.5z" />
        </svg>
      );
    case "Twitter":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M17.5 4.5h3l-6.5 7.4L21.5 19.5h-6l-4.7-6.1-5.4 6.1H2.5l7-8L2.5 4.5h6.1l4.2 5.5 4.7-5.5zm-1.1 13.5h1.7L7.1 6.2H5.3l11.1 11.8z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M8 3h8a5 5 0 015 5v8a5 5 0 01-5 5H8a5 5 0 01-5-5V8a5 5 0 015-5zm0 2a3 3 0 00-3 3v8a3 3 0 003 3h8a3 3 0 003-3V8a3 3 0 00-3-3H8zm9.5 1.2a1 1 0 110 2 1 1 0 010-2zM12 8a4 4 0 110 8 4 4 0 010-8z" />
        </svg>
      );
    case "YouTube":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M21.6 7.2a2.5 2.5 0 00-1.8-1.8C17.8 5 12 5 12 5s-5.8 0-7.8.4A2.5 2.5 0 002.4 7.2 26 26 0 002 12a26 26 0 00.4 4.8 2.5 2.5 0 001.8 1.8C6.2 19 12 19 12 19s5.8 0 7.8-.4a2.5 2.5 0 001.8-1.8A26 26 0 0022 12a26 26 0 00-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
        </svg>
      );
    default:
      return (
        <span className={cn("text-[10px] font-bold", className)} aria-hidden>
          {label[0]}
        </span>
      );
  }
}

export function SocialLinks({
  className,
  iconClassName,
  variant = "default",
}: {
  className?: string;
  iconClassName?: string;
  variant?: "default" | "compact";
}) {
  const compact = variant === "compact";

  return (
    <div className={cn("flex items-center", compact ? "gap-0.5" : "gap-1.5", className)}>
      {SOCIAL_LINKS.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "flex items-center justify-center transition",
            compact
              ? "h-7 w-7 rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-accent"
              : "h-8 w-8 rounded-full border border-zinc-300/80 text-zinc-600 hover:border-accent hover:bg-accent/5 hover:text-accent"
          )}
          aria-label={social.label}
        >
          <SocialIcon
            label={social.label}
            className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4", iconClassName)}
          />
        </a>
      ))}
    </div>
  );
}
