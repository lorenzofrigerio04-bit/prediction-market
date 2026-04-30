"use client";

import { Fragment, useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { SectionHeader } from "@/components/home/football/premium/SectionHeader";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsEventsTickerSeparator } from "@/components/news/NewsEventsTickerSeparator";
import { useNewsPageEventsMarquee } from "@/lib/hooks/useNewsPageEventsMarquee";
import type { NewsFormat } from "@/lib/news-engine/types";
import { NEWS_SECTIONS, slugFromNewsFormat } from "@/lib/news-format-sections";
import { newsRailEdgeMaskStyle } from "@/lib/news-rail-mask";

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
        <div className="mb-2.5 h-2 w-20 rounded-full bg-white/[0.06]" />
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

function NewsSection({
  format,
  title,
  accent,
  articles,
}: {
  format: NewsFormat;
  title: string;
  accent: "crimson" | "violet" | "primary" | "gold" | "emerald";
  articles: NewsArticle[];
}) {
  if (articles.length === 0) return null;

  const formatPath = `/news/format/${slugFromNewsFormat(format)}`;

  return (
    <section>
      <SectionHeader
        eyebrow=""
        title={title}
        accent={accent}
        articleHeadlineTitle
        eyebrowTrailing
        ctaOnly
        href={formatPath}
        hrefLabel="vedi tutti"
      />
      <div className="-mx-4">
        <div className="scrollbar-hide overflow-x-auto px-4 pb-1" style={newsRailEdgeMaskStyle}>
          <div className="flex gap-2.5 pb-2" style={{ width: "max-content" }}>
            {articles.map((a) => (
              <NewsCard key={a.id} article={a} layout="rail" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function NewsPage() {
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { events: marqueeEvents, ready: eventsMarqueeReady } = useNewsPageEventsMarquee(28);
  const showEventsMarquee = eventsMarqueeReady && marqueeEvents.length >= 2;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news?limit=50&page=1");
      if (!res.ok) return;
      const data = (await res.json()) as { ok: boolean; articles: NewsArticle[] };
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

      <div className="mx-auto max-w-2xl px-4 pb-28 pt-6">
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
            {NEWS_SECTIONS.map((section, index) => (
              <Fragment key={section.format}>
                <NewsSection
                  format={section.format}
                  title={section.title}
                  accent={section.accent}
                  articles={byFormat(section.format)}
                />
                {showEventsMarquee && index < NEWS_SECTIONS.length - 1 ? (
                  <NewsEventsTickerSeparator
                    events={marqueeEvents}
                    direction={index % 2 === 0 ? "left" : "right"}
                    phaseShift={index * 5}
                  />
                ) : null}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
