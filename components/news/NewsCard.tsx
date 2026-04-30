"use client";

import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import type { NewsFormat } from "@/lib/news-engine/types";
import {
  FORMAT_ACCENT,
  PERSONA_AVATARS,
  PERSONA_DISPLAY_NAME,
  timeAgo,
} from "@/lib/news-article-ui";

const newsPreviewBody = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
});

export interface NewsArticleCardModel {
  id: string;
  slug: string;
  format: NewsFormat;
  title: string;
  excerpt: string;
  body: string;
  authorPersona: string;
  readingTimeMin: number;
  publishedAt: string;
}

export function articlePreviewText(article: Pick<NewsArticleCardModel, "excerpt" | "body">): string {
  const ex = article.excerpt?.trim();
  if (ex) return ex;
  return article.body.split(/[.!?]\s+/).slice(0, 2).join(". ").trim();
}

type NewsCardProps = {
  article: NewsArticleCardModel;
  /** rail: card orizzontali homepage news; stack: lista full-width pagina categoria; mini: stesso look rail, compatto (homepage ticker) */
  layout?: "rail" | "stack" | "mini";
};

export function NewsCard({ article, layout = "rail" }: NewsCardProps) {
  const format = article.format;
  const accent = FORMAT_ACCENT[format];
  const displayName = PERSONA_DISPLAY_NAME[article.authorPersona] ?? article.authorPersona;
  const avatarSrc = PERSONA_AVATARS[article.authorPersona];
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const preview = articlePreviewText(article);

  const isMini = layout === "mini";
  const isStack = layout === "stack";

  const widthClasses = isStack
    ? "w-full min-w-0 max-w-none flex-col"
    : isMini
      ? "w-[168px] min-w-[168px] shrink-0 flex-col sm:w-[176px] sm:min-w-[176px]"
      : "w-[260px] min-w-[260px] shrink-0 flex-col sm:w-[268px] sm:min-w-[268px]";

  const titleClass = isStack
    ? "text-[1.06rem] sm:text-[1.15rem]"
    : isMini
      ? "text-[0.78rem] sm:text-[0.8125rem]"
      : "text-[1.02rem] sm:text-[1.0625rem]";

  const padClasses = isMini ? "p-2.5 sm:p-2.5" : "p-4 sm:p-[1.125rem]";
  const radiusClass = isMini ? "rounded-[0.95rem]" : "rounded-[1.15rem]";
  const avatarPx = isMini ? 28 : 40;
  const avatarBorderW = isMini ? 1 : 1.5;

  return (
    <Link
      href={`/news/${encodeURIComponent(article.slug)}`}
      className={[
        "group relative flex text-left",
        widthClasses,
        radiusClass,
        padClasses,
        "border border-white/[0.06] bg-white/[0.015]",
        isMini
          ? "transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out hover:border-white/[0.11] hover:bg-white/[0.03] hover:shadow-[0_12px_32px_-18px_rgba(0,0,0,0.55)]"
          : "transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out hover:border-white/[0.11] hover:bg-white/[0.03] hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.5)]",
        "active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background-primary))]",
      ].join(" ")}
    >
      {/* Meta: avatar, nome, data */}
      <div className={isMini ? "flex items-center gap-2" : "flex items-center gap-3"}>
        <div
          className={[
            "relative shrink-0 overflow-hidden rounded-full",
            isMini ? "h-7 w-7" : "h-10 w-10",
          ].join(" ")}
          style={{
            border: `${avatarBorderW}px solid ${accent.cardBorder}`,
            boxShadow: isMini
              ? `0 0 14px -6px ${accent.glow}`
              : `0 0 22px -8px ${accent.glow}`,
          }}
        >
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt=""
              width={avatarPx}
              height={avatarPx}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className={[
                "flex h-full w-full items-center justify-center font-bold text-white",
                isMini ? "text-[8px]" : "text-[10px]",
              ].join(" ")}
              style={{ background: accent.glow }}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={[
              "flex flex-wrap items-center gap-x-1.5 gap-y-0.5",
              isMini ? "min-h-7" : "min-h-10",
            ].join(" ")}
          >
            <span
              className={[
                "truncate font-semibold tracking-tight text-white",
                isMini ? "max-w-[5.75rem] text-[10px]" : "max-w-[9.5rem] text-[13px]",
              ].join(" ")}
            >
              {displayName}
            </span>
            <span className={isMini ? "text-[9px] text-white/28" : "text-[11px] text-white/28"}>
              ·
            </span>
            <time
              className={isMini ? "text-[9px] text-white/38" : "text-[11px] text-white/38"}
              dateTime={article.publishedAt}
            >
              {timeAgo(article.publishedAt)}
            </time>
          </div>
        </div>
      </div>

      <header className={isMini ? "mt-2" : "mt-4"}>
        <h3
          className={`line-clamp-2 ${titleClass} font-bold leading-[1.12] tracking-[-0.022em] text-white transition-colors duration-200 group-hover:text-white/92`}
          style={{ fontFamily: "var(--font-kalshi-title)" }}
        >
          {article.title}
        </h3>
        <div className={isMini ? "relative mt-2 w-full" : "relative mt-4 w-full"} aria-hidden>
          <div
            className="h-px w-full"
            style={{
              background: accent.topBar,
              boxShadow: isMini
                ? `0 0 10px -2px ${accent.glow}, 0 0 1px rgba(255,255,255,0.06)`
                : `0 0 18px -2px ${accent.glow}, 0 0 1px rgba(255,255,255,0.06)`,
            }}
          />
        </div>
      </header>

      {preview ? (
        <div
          className={`${newsPreviewBody.className} flex flex-col ${isMini ? "mt-2 gap-1" : "mt-4 gap-2.5"}`}
        >
          <p
            className={[
              "font-normal antialiased [overflow-wrap:anywhere]",
              isMini
                ? "line-clamp-2 text-[0.6875rem] leading-[1.45] tracking-[0.01em] text-white/[0.5]"
                : "line-clamp-3 text-[0.8125rem] leading-[1.62] tracking-[0.01em] text-white/[0.52]",
            ].join(" ")}
          >
            {preview}
          </p>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span
              className={[
                "shrink-0 font-medium tabular-nums text-white/38",
                isMini ? "text-[9px]" : "text-[11px]",
              ].join(" ")}
            >
              {article.readingTimeMin} min lettura
            </span>
            <span
              className={[
                "inline-flex min-w-0 items-center justify-end gap-1 font-kalshi font-semibold leading-none tracking-[-0.02em] transition-[opacity,transform] duration-200 group-hover:opacity-90",
                isMini ? "text-[9px] sm:text-[10px]" : "text-[11px] sm:text-xs",
                accent.labelColor,
              ].join(" ")}
            >
              Leggi di più
              <span
                aria-hidden
                className={[
                  "font-bold opacity-90 transition-transform duration-200 group-hover:translate-x-0.5",
                  isMini ? "text-[0.72rem]" : "text-[0.8rem]",
                ].join(" ")}
              >
                →
              </span>
            </span>
          </div>
        </div>
      ) : null}
    </Link>
  );
}
