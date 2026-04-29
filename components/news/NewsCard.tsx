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
  /** rail: card orizzontali homepage; stack: lista full-width pagina categoria */
  layout?: "rail" | "stack";
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

  const widthClasses =
    layout === "stack"
      ? "w-full min-w-0 max-w-none flex-col"
      : "w-[260px] min-w-[260px] shrink-0 flex-col sm:w-[268px] sm:min-w-[268px]";

  const titleClass =
    layout === "stack"
      ? "text-[1.06rem] sm:text-[1.15rem]"
      : "text-[1.02rem] sm:text-[1.0625rem]";

  return (
    <Link
      href={`/news/${encodeURIComponent(article.slug)}`}
      className={[
        "group relative flex text-left",
        widthClasses,
        "rounded-[1.15rem] border border-white/[0.06] bg-white/[0.015] p-4 sm:p-[1.125rem]",
        "transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out",
        "hover:border-white/[0.11] hover:bg-white/[0.03] hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.5)]",
        "active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background-primary))]",
      ].join(" ")}
    >
      {/* Meta: avatar, nome, data */}
      <div className="flex items-center gap-3">
        <div
          className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full"
          style={{
            border: `1.5px solid ${accent.cardBorder}`,
            boxShadow: `0 0 22px -8px ${accent.glow}`,
          }}
        >
          {avatarSrc ? (
            <Image src={avatarSrc} alt="" width={40} height={40} className="h-full w-full object-cover" />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white"
              style={{ background: accent.glow }}
            >
              {initials}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-h-10 flex-wrap items-center gap-x-1.5 gap-y-0.5">
            <span className="max-w-[9.5rem] truncate text-[13px] font-semibold tracking-tight text-white">
              {displayName}
            </span>
            <span className="text-[11px] text-white/28">·</span>
            <time className="text-[11px] text-white/38" dateTime={article.publishedAt}>
              {timeAgo(article.publishedAt)}
            </time>
          </div>
        </div>
      </div>

      <header className="mt-4">
        <h3
          className={`line-clamp-2 ${titleClass} font-bold leading-[1.12] tracking-[-0.022em] text-white transition-colors duration-200 group-hover:text-white/92`}
          style={{ fontFamily: "var(--font-kalshi-title)" }}
        >
          {article.title}
        </h3>
        <div className="relative mt-4 w-full" aria-hidden>
          <div
            className="h-px w-full"
            style={{
              background: accent.topBar,
              boxShadow: `0 0 18px -2px ${accent.glow}, 0 0 1px rgba(255,255,255,0.06)`,
            }}
          />
        </div>
      </header>

      {preview ? (
        <div className={`${newsPreviewBody.className} mt-4 flex flex-col gap-2.5`}>
          <p className="text-[0.8125rem] font-normal leading-[1.62] tracking-[0.01em] text-white/[0.52] antialiased [overflow-wrap:anywhere] line-clamp-3">
            {preview}
          </p>
          <div className="flex items-center justify-between gap-3 pt-0.5">
            <span className="shrink-0 text-[11px] font-medium tabular-nums text-white/38">
              {article.readingTimeMin} min lettura
            </span>
            <span
              className={`inline-flex min-w-0 items-center justify-end gap-1.5 font-kalshi text-[11px] font-semibold leading-none tracking-[-0.02em] sm:text-xs ${accent.labelColor} transition-[opacity,transform] duration-200 group-hover:opacity-90`}
            >
              Leggi di più
              <span
                aria-hidden
                className="text-[0.8rem] font-bold opacity-90 transition-transform duration-200 group-hover:translate-x-0.5"
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
