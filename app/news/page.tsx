"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import { SectionHeader } from "@/components/home/football/premium/SectionHeader";
import type { NewsFormat } from "@/lib/news-engine/types";
import {
  FORMAT_ACCENT,
  formatArticleKindLabel,
  PERSONA_AVATARS,
  PERSONA_DISPLAY_NAME,
  timeAgo,
} from "@/lib/news-article-ui";

/** Anteprima lista: stesso Inter del corpo articolo singolo */
const newsPreviewBody = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsArticle {
  id: string;
  slug: string;
  format: NewsFormat;
  category: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  body: string;
  authorPersona: string;
  imageUrl: string | null;
  readingTimeMin: number;
  featured: boolean;
  publishedAt: string;
  viewCount: number;
  relatedEventId: string | null;
  relatedEvent: {
    id: string;
    title: string;
    probability: number | null;
    status: string;
  } | null;
}

function articlePreviewText(article: NewsArticle): string {
  const ex = article.excerpt?.trim();
  if (ex) return ex;
  return article.body.split(/[.!?]\s+/).slice(0, 2).join(". ").trim();
}

type SectionConfig = {
  format: NewsFormat;
  eyebrow: string;
  title: string;
  accent: "crimson" | "violet" | "primary" | "gold" | "emerald";
};

// ─── Section definitions ───────────────────────────────────────────────────────

const SECTIONS: SectionConfig[] = [
  {
    format: "BREAKING",
    eyebrow: "Ultime ore",
    title: "Breaking News",
    accent: "crimson",
  },
  {
    format: "GOSSIP",
    eyebrow: "Voci di corridoio",
    title: "Gossip & Rumors",
    accent: "violet",
  },
  {
    format: "ANALYTICS",
    eyebrow: "Dati esclusivi",
    title: "Analytics",
    accent: "primary",
  },
  {
    format: "REPORT",
    eyebrow: "Approfondimenti",
    title: "Report",
    accent: "gold",
  },
  {
    format: "HOT_TAKE",
    eyebrow: "Opinioni scomode",
    title: "Hot Takes",
    accent: "emerald",
  },
];

// ─── News Card (allineato struttura pagina singola articolo) ───────────────────

function NewsCard({ article }: { article: NewsArticle }) {
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

  return (
    <Link
      href={`/news/${encodeURIComponent(article.slug)}`}
      className={[
        "group relative flex w-[260px] min-w-[260px] shrink-0 flex-col text-left sm:w-[268px] sm:min-w-[268px]",
        "rounded-[1.15rem] border border-white/[0.06] bg-white/[0.015] p-4",
        "transition-[transform,border-color,background-color,box-shadow] duration-300 ease-out",
        "hover:border-white/[0.11] hover:bg-white/[0.03] hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.5)]",
        "active:scale-[0.992] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background-primary))]",
      ].join(" ")}
    >
      {/* Meta: avatar + nome + tempo + formato */}
      <div className="flex gap-3">
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
        <div className="min-w-0 flex-1 pt-px">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
            <span className="max-w-[9.5rem] truncate text-[13px] font-semibold tracking-tight text-white">
              {displayName}
            </span>
            <span className="text-[11px] text-white/28">·</span>
            <time className="text-[11px] text-white/38" dateTime={article.publishedAt}>
              {timeAgo(article.publishedAt)}
            </time>
            <span className="text-[11px] text-white/28">·</span>
            <span className="text-[11px] text-white/38">{article.readingTimeMin} min</span>
          </div>
          <div className="mt-1">
            <span
              className={`inline-flex items-center gap-1.5 font-[Oswald] text-[9px] font-semibold uppercase tracking-[0.2em] ${accent.labelColor}`}
            >
              <span className={`h-1 w-1 shrink-0 rounded-full ${accent.dot}`} />
              {formatArticleKindLabel(format)}
            </span>
          </div>
        </div>
      </div>

      <header className="mt-4">
        <h3
          className="line-clamp-2 text-[1.02rem] font-bold leading-[1.12] tracking-[-0.022em] text-white transition-colors duration-200 group-hover:text-white/92 sm:text-[1.0625rem]"
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
          <div className="flex justify-end pt-0.5">
            <span
              className={`inline-flex items-center gap-1.5 font-kalshi text-[11px] font-semibold leading-none tracking-[-0.02em] sm:text-xs ${accent.labelColor} transition-[opacity,transform] duration-200 group-hover:opacity-90`}
            >
              Leggi tutto
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

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="w-[260px] min-w-[260px] shrink-0 rounded-[1.15rem] animate-pulse border border-white/[0.06] bg-white/[0.03] sm:w-[268px] sm:min-w-[268px]"
      style={{
        minHeight: "17.5rem",
        background: "linear-gradient(165deg, rgba(255,255,255,0.045) 0%, rgba(0,0,0,0.1) 100%)",
      }}
    />
  );
}

function SectionSkeleton() {
  return (
    <div>
      <div className="mb-5 animate-pulse">
        <div className="h-2 w-20 rounded-full bg-white/[0.06] mb-2.5" />
        <div className="h-8 w-48 rounded-md bg-white/[0.08]" />
        <div className="mt-3 h-px w-full bg-gradient-to-r from-white/[0.1] via-white/[0.03] to-transparent" />
      </div>
      <div className="flex gap-2.5 overflow-hidden pb-2">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

// ─── News section (horizontal rail) ──────────────────────────────────────────

function NewsSection({ config, articles }: { config: SectionConfig; articles: NewsArticle[] }) {
  if (articles.length === 0) return null;

  return (
    <section>
      <SectionHeader
        eyebrow={config.eyebrow}
        title={config.title}
        accent={config.accent}
        articleHeadlineTitle
      />
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2.5 pb-2" style={{ width: "max-content" }}>
          {articles.map((a) => (
            <NewsCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news?limit=50&page=1");
      if (!res.ok) return;
      const data = await res.json() as { ok: boolean; articles: NewsArticle[] };
      setAllArticles(data.articles ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const byFormat = (format: NewsFormat) => allArticles.filter((a) => a.format === format);

  return (
    <div className="min-h-screen" style={{ background: "rgb(var(--background-primary))" }}>
      <Header showCategoryStrip={false} />

      <div className="mx-auto max-w-2xl px-4 pt-6 pb-28">
        {loading ? (
          <div className="space-y-12">
            <SectionSkeleton />
            <SectionSkeleton />
            <SectionSkeleton />
          </div>
        ) : allArticles.length === 0 ? (
          <div className="relative overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(80,245,252,0.06),transparent_70%)]"
            />
            <div className="relative flex flex-col items-center gap-4">
              <p
                className="text-[1.5rem] font-bold tracking-[-0.022em] text-white"
                style={{ fontFamily: "var(--font-kalshi-title)" }}
              >
                Nessuna news ancora
              </p>
              <p className="text-[13px] text-white/40">Aggiorniamo spesso questa sezione · Torna presto</p>
            </div>
          </div>
        ) : (
          <div className="space-y-14">
            {SECTIONS.map((section) => (
              <NewsSection key={section.format} config={section} articles={byFormat(section.format)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
