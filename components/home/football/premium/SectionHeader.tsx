"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accent?: "primary" | "gold" | "crimson" | "violet" | "emerald";
  /** Stesso stack e metriche dell’h1 articolo news (Barlow Condensed, tracking stretto, titolo naturale). */
  articleHeadlineTitle?: boolean;
  /** Eyebrow (es. "Ultime ore") sulla stessa riga del titolo, allineata a destra — tipico pagina News. */
  eyebrowTrailing?: boolean;
  /** Solo link CTA a destra, senza badge eyebrow (homepage News "vedi tutti →"). */
  ctaOnly?: boolean;
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
  articleHeadlineTitle = false,
  eyebrowTrailing = false,
  ctaOnly = false,
  href,
  hrefLabel = "Vedi tutti",
  leftSlot,
}: Props) {
  const a = ACCENT_MAP[accent];

  const eyebrowRow = (
    <div className="flex items-center gap-2 shrink-0">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${a.dot}`} aria-hidden />
      <span className={`news-format-badge text-[12px] font-semibold leading-none tracking-[0.01em] ${a.text}`}>
        {eyebrow}
      </span>
      {leftSlot}
    </div>
  );

  const trailingLink = href ? (
    <Link
      href={href}
      className={`news-format-badge group relative flex shrink-0 items-center gap-1 text-[12px] font-semibold leading-none tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded ${a.text} hover:opacity-80`}
    >
      <span
        className={`absolute -inset-x-2 -inset-y-1 rounded-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-current/[0.07]`}
        aria-hidden
      />
      {hrefLabel}
      <svg
        aria-hidden
        className="inline-block h-3 w-3 translate-x-0 transition-transform group-hover:translate-x-0.5"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 6h8M7 3l3 3-3 3" />
      </svg>
    </Link>
  ) : null;

  if (articleHeadlineTitle && eyebrowTrailing) {
    return (
      <header className="mb-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="min-w-0 flex-1 text-[1.62rem] font-bold leading-[1.1] tracking-[-0.022em] text-white sm:text-[1.9rem]" style={{ fontFamily: "var(--font-kalshi-title)" }}>
            {title}
          </h2>
          <div className="flex shrink-0 items-center gap-4">
            {ctaOnly ? null : eyebrowRow}
            {trailingLink}
          </div>
        </div>
        {subtitle ? <p className="mt-1 text-[0.8125rem] text-white/50">{subtitle}</p> : null}
        <div className={`mt-3 h-px w-full bg-gradient-to-r ${a.line}`} aria-hidden />
      </header>
    );
  }

  return (
    <header className="mb-5">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          {eyebrowRow}
          <h2
            className={
              articleHeadlineTitle
                ? "mt-2.5 text-[1.62rem] font-bold leading-[1.1] tracking-[-0.022em] text-white sm:text-[1.9rem]"
                : "mt-2.5 text-[2rem] leading-[1.0] text-white sm:text-[2.25rem] uppercase font-bold"
            }
            style={{
              fontFamily: "var(--font-kalshi-title)",
              ...(!articleHeadlineTitle ? { letterSpacing: "0.04em" } : {}),
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[0.8125rem] text-white/50">{subtitle}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className={`news-format-badge group relative shrink-0 flex items-center gap-1 text-[12px] font-semibold leading-none tracking-[0.01em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded ${a.text} hover:opacity-80`}
          >
            <span className={`absolute -inset-x-2 -inset-y-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-current/[0.07]`} aria-hidden />
            {hrefLabel}
            <svg
              aria-hidden
              className="w-3 h-3 inline-block translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 6h8M7 3l3 3-3 3" />
            </svg>
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
