"use client";

import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import type { NewsFormat } from "@/lib/news-engine/types";
import { FORMAT_ACCENT } from "@/lib/news-article-ui";
import { NEWS_PROFILE_ACTION_LINE_RGB } from "@/lib/news-format-social-display";
import { articlePreviewText } from "@/components/news/NewsCard";

const excerptFont = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
});

export type NewsAuthorGridArticle = {
  id: string;
  slug: string;
  title: string;
  format: NewsFormat;
  imageUrl: string | null;
  excerpt: string;
  body: string;
};

function TileImage({ src }: { src: string }) {
  const remote = /^https?:\/\//i.test(src);
  if (remote) {
    return (
      <img
        src={src}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-500 ease-out group-hover/tile:scale-[1.03]"
        loading="lazy"
      />
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes="(max-width: 640px) 50vw, 328px"
      className="object-cover transition-[transform,filter] duration-500 ease-out group-hover/tile:scale-[1.03]"
    />
  );
}

/** Hairline color rubrica nel tile: attenuazione da sinistra verso destra. */
function TitleBodyHairline({ format }: { format: NewsFormat }) {
  const rgb = NEWS_PROFILE_ACTION_LINE_RGB[format];
  const [r, g, b] = rgb;
  return (
    <div className="relative mt-3 w-full shrink-0" aria-hidden>
      <div
        className="h-[2px] w-full rounded-full"
        style={{
          background: `linear-gradient(90deg, rgba(${r},${g},${b},0.94) 0%, rgba(${r},${g},${b},0.48) 38%, rgba(${r},${g},${b},0.12) 72%, rgba(${r},${g},${b},0) 100%)`,
          boxShadow: `6px 0 22px -4px rgba(${r},${g},${b},0.42), 0 0 14px -5px rgba(${r},${g},${b},0.2), inset 0 1px 0 rgba(255,255,255,0.14)`,
        }}
      />
    </div>
  );
}

function GridTile({ article }: { article: NewsAuthorGridArticle }) {
  const accent = FORMAT_ACCENT[article.format];
  const preview = articlePreviewText({
    excerpt: article.excerpt,
    body: article.body,
  });
  const hasImage = Boolean(article.imageUrl?.trim());

  return (
    <li className="flex min-h-0 flex-col">
      <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[11px] border border-white/[0.07] bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-[transform,box-shadow,border-color] duration-300 ease-out after:pointer-events-none after:absolute after:inset-0 after:rounded-[11px] after:ring-1 after:ring-inset after:ring-white/[0.05] after:content-[''] hover:border-white/[0.11] hover:shadow-[0_20px_50px_-28px_rgba(0,0,0,0.65)]">
        <Link
          href={`/news/${encodeURIComponent(article.slug)}`}
          className="group/tile relative flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background-primary))]"
        >
          {hasImage && article.imageUrl ? (
            <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-black/20">
              <TileImage src={article.imageUrl} />
            </div>
          ) : null}

          <div
            className={[
              "flex min-h-[7.5rem] flex-1 flex-col px-2.5 pb-2.5 sm:px-3 sm:pb-3",
              hasImage ? "pt-2 sm:pt-2.5" : "bg-[radial-gradient(110%_120%_at_50%_-20%,rgba(255,255,255,0.04),transparent_55%)] pt-3 sm:pt-3.5",
            ].join(" ")}
          >
            <h3
              className="line-clamp-2 text-left font-sans text-[12.5px] font-bold leading-[1.22] tracking-[-0.022em] text-white/[0.96] transition-colors duration-200 group-hover/tile:text-white sm:text-[13.25px] sm:leading-[1.24]"
              style={{ fontFamily: "var(--font-kalshi-title)" }}
            >
              {article.title}
            </h3>

            <TitleBodyHairline format={article.format} />

            {preview ? (
              <p
                className={`${excerptFont.className} mt-1.5 line-clamp-3 text-left text-[0.625rem] font-normal leading-[1.48] tracking-[0.01em] text-white/[0.48] antialiased [overflow-wrap:anywhere] sm:text-[0.65625rem] sm:leading-[1.5]`}
              >
                {preview}
              </p>
            ) : null}

            <span className="pointer-events-none mt-auto flex justify-end pt-1.5 opacity-[0.85]">
              <span
                className={`inline-flex items-center gap-1 font-kalshi text-[10px] font-semibold tracking-[-0.02em] sm:text-[11px] ${accent.labelColor}`}
              >
                Leggi
                <span
                  aria-hidden
                  className="translate-x-0 transition-transform duration-200 group-hover/tile:translate-x-0.5"
                >
                  →
                </span>
              </span>
            </span>
          </div>
        </Link>
      </div>
    </li>
  );
}

export function NewsAuthorPostGrid({ articles }: { articles: NewsAuthorGridArticle[] }) {
  return (
    <ul className="grid grid-cols-2 gap-[5px] sm:gap-2 md:gap-[10px]">
      {articles.map((article) => (
        <GridTile key={article.id} article={article} />
      ))}
    </ul>
  );
}

export function NewsAuthorPostGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-[5px] sm:gap-2 md:gap-[10px]" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex min-h-[7.5rem] flex-col overflow-hidden rounded-[11px] border border-white/[0.06] bg-white/[0.015]"
          style={{
            background:
              "radial-gradient(110% 120% at 50% -20%, rgba(255,255,255,0.04), transparent 55%), linear-gradient(168deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.06) 100%)",
          }}
        >
          <div className="flex flex-col gap-2 px-2.5 pb-3 pt-3 sm:px-3 sm:pt-3.5">
            <div className="h-3 w-[92%] animate-pulse rounded-md bg-white/[0.08]" />
            <div className="h-3 w-[64%] animate-pulse rounded-md bg-white/[0.06]" />
            <div className="mt-1 h-px w-full bg-white/[0.08]" />
            <div className="h-2.5 w-full animate-pulse rounded-md bg-white/[0.06]" />
            <div className="h-2.5 w-[88%] animate-pulse rounded-md bg-white/[0.05]" />
          </div>
        </li>
      ))}
    </ul>
  );
}
