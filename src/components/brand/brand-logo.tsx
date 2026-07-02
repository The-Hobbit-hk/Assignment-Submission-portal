import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_FULL = "/logo-rotaract-3131.png";
const LOGO_MARK = "/logo-rotaract-mark.png";

/** Official cranberry logo asset ratio (1024×981) */
const FULL_RATIO = 1024 / 981;
const FULL_WIDTH = 1024;
const FULL_HEIGHT = 981;

const fullSizes = {
  nav: "h-10 w-auto max-w-[10.5rem]",
  md: "h-14 w-auto max-w-[15rem]",
  lg: "h-20 w-auto max-w-[21rem]",
  hero: "h-auto w-full max-w-md",
} as const;

interface BrandLogoProps {
  variant?: "full" | "mark" | "sidebar";
  size?: keyof typeof fullSizes;
  href?: string;
  linked?: boolean;
  className?: string;
  priority?: boolean;
  onClick?: () => void;
}

export function BrandLogo({
  variant = "full",
  size = "md",
  href = "/",
  linked = true,
  className,
  priority = false,
  onClick,
}: BrandLogoProps) {
  if (variant === "sidebar") {
    const sidebar = (
      <div className={cn("flex items-center gap-2.5", className)}>
        <Image
          src={LOGO_MARK}
          alt=""
          width={36}
          height={36}
          priority={priority}
          className="h-8 w-8 shrink-0 object-contain"
          aria-hidden
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-semibold tracking-tight text-foreground">
            Rotaract
          </p>
          <p className="truncate text-[11px] text-muted-foreground">District 3131</p>
        </div>
      </div>
    );

    if (!linked) return sidebar;
    return (
      <Link href={href} onClick={onClick} className="block min-w-0">
        {sidebar}
      </Link>
    );
  }

  const src = variant === "mark" ? LOGO_MARK : LOGO_FULL;
  const isMark = variant === "mark";

  const image = (
    <Image
      src={src}
      alt="Rotaract District 3131"
      width={isMark ? 171 : FULL_WIDTH}
      height={isMark ? 168 : FULL_HEIGHT}
      priority={priority}
      className={cn(
        "object-contain",
        isMark ? "h-10 w-10" : cn("h-auto", fullSizes[size]),
        className
      )}
      style={!isMark ? { aspectRatio: FULL_RATIO } : undefined}
    />
  );

  if (!linked) return image;

  return (
    <Link href={href} onClick={onClick} className="inline-flex shrink-0 items-center">
      {image}
    </Link>
  );
}
