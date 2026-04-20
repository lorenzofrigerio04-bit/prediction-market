"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: "primary" | "gold" | "crimson" | "violet" | "emerald";
  href?: string;
  hrefLabel?: string;
  leftSlot?: ReactNode;
}

const ACCENT_MAP: Record<
  NonNullable<Props["accent"]>,
  { line: string; dot: string; text: string }
> = {
  primary: {
    line: "from-primary/70 via-primary/20 to-transparent",
    dot: "bg-primary shadow-[0_0_12px_rgba(80,245,252,0.65)]",
    text: "text-primary",
  },
  gold: {
    line: "from-amber-300/70 via-amber-400/20 to-transparent",
    dot: "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.55)]",
    text: "text-amber-300",
  },
  crimson: {
    line: "from-rose-500/70 via-rose-500/20 to-transparent",
    dot: "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.65)]",
    text: "text-rose-400",
  },
  violet: {
    line: "from-violet-400/70 via-violet-400/20 to-transparent",
    dot: "bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.6)]",
    text: "text-violet-300",
  },
  emerald: {
    line: "from-emerald-400/70 via-emerald-400/20 to-transparent",
    dot: "bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.65)]",
    text: "text-emerald-300",
  },
};

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  accent = "primary",
  href,
  hrefLabel = "Vedi tutti",
  leftSlot,
}: Props) {
  const a = ACCENT_MAP[accent];
  return (
    <header className="mb-5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${a.dot}`}
              aria-hidden
            />
            <span
              className={`font-[Oswald] text-[10px] font-semibold uppercase tracking-[0.28em] ${a.text}`}
            >
              {eyebrow}
            </span>
            {leftSlot}
          </div>
          <h2 className="mt-1.5 font-kalshi text-[1.75rem] font-bold leading-[1.0] tracking-wide text-white sm:text-[2rem]">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[0.8125rem] text-white/50">{subtitle}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="group shrink-0 pb-1 text-[0.78rem] font-semibold tracking-wide text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded"
          >
            {hrefLabel}{" "}
            <span
              aria-hidden
              className="inline-block translate-x-0 transition-transform group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        )}
      </div>
      <div
        className={`mt-3 h-px w-full bg-gradient-to-r ${a.line}`}
        aria-hidden
      />
    </header>
  );
}
