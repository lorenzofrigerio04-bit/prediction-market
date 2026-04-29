"use client";

import { Inter } from "next/font/google";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { notFound, useParams } from "next/navigation";
import Header from "@/components/Header";
import BackLink from "@/components/ui/BackLink";
import { AvatarImageLightbox } from "@/components/ui/AvatarImageLightbox";
import { NewsAuthorPostGrid, NewsAuthorPostGridSkeleton } from "@/components/news/NewsAuthorPostGrid";
import type { NewsArticleCardModel } from "@/components/news/NewsCard";
import { FORMAT_ACCENT } from "@/lib/news-article-ui";
import { NEWS_FORMAT_AUTHOR_BIO } from "@/lib/news-format-author-bio";
import { NEWS_SECTIONS, newsFormatFromSlug } from "@/lib/news-format-sections";
import { simulatedFollowerCount } from "@/lib/news-format-follower-count";
import { formatSocialCount } from "@/lib/news-format-social-display";
import { PERSONAS } from "@/lib/news-engine/types";

const bioBody = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
});

interface ArticlePayload extends NewsArticleCardModel {
  category: string;
  subtitle: string | null;
  featured: boolean;
  imageUrl: string | null;
  viewCount: number;
  relatedEventId: string | null;
  relatedEvent: unknown;
}

const PAGE_SIZE = 24;

/** Hairline bianca premium: sotto «Segui» e sopra la griglia articoli (stesso look). */
const PROFILE_GRID_WHITE_HAIRLINE: CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 14%, rgba(255,255,255,0.78) 50%, rgba(255,255,255,0.1) 86%, rgba(255,255,255,0) 100%)",
  boxShadow:
    "0 0 14px rgba(255,255,255,0.12), 0 0 32px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.38)",
};

const FOLLOW_STORAGE_PREFIX = "pm-news-follow:";

export default function NewsFormatPage() {
  const params = useParams();
  const raw = params?.format;
  const slug = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const format = newsFormatFromSlug(slug);

  const sectionMeta = format ? NEWS_SECTIONS.find((s) => s.format === format) : undefined;

  const [articles, setArticles] = useState<ArticlePayload[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPostsCount, setTotalPostsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [followingAuthor, setFollowingAuthor] = useState(false);

  const load = useCallback(
    async (nextPage: number, append: boolean) => {
      if (!format) return;
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const res = await fetch(
          `/api/news?format=${encodeURIComponent(format)}&limit=${PAGE_SIZE}&page=${nextPage}`
        );
        if (!res.ok) return;
        const data = (await res.json()) as {
          ok: boolean;
          articles: ArticlePayload[];
          pagination?: { totalPages: number; page: number; total?: number };
        };
        const list = data.articles ?? [];
        if (append) setArticles((prev) => [...prev, ...list]);
        else setArticles(list);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages);
          setPage(data.pagination.page);
          if (!append && typeof data.pagination.total === "number") {
            setTotalPostsCount(data.pagination.total);
          }
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [format]
  );

  useEffect(() => {
    if (!format) return;
    setPage(1);
    setTotalPostsCount(null);
    load(1, false);
  }, [format, load]);

  useEffect(() => {
    if (!format) return;
    try {
      setFollowingAuthor(localStorage.getItem(`${FOLLOW_STORAGE_PREFIX}${format}`) === "1");
    } catch {
      setFollowingAuthor(false);
    }
  }, [format]);

  const toggleFollow = useCallback(() => {
    if (!format) return;
    setFollowingAuthor((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(`${FOLLOW_STORAGE_PREFIX}${format}`, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [format]);

  const followerCount = useMemo(() => (format ? simulatedFollowerCount(format) : 0), [format]);

  if (!slug || !format || !sectionMeta) {
    notFound();
  }

  const accent = FORMAT_ACCENT[format];
  const persona = PERSONAS[format];
  const authorBio = NEWS_FORMAT_AUTHOR_BIO[format];

  const postsFormatted =
    totalPostsCount !== null ? formatSocialCount(totalPostsCount) : loading ? "…" : "—";

  const followersFormatted = formatSocialCount(followerCount);

  /** Una sola hairline bianca tra profilo e griglia (evita doppia linea con ex-linea sotto «Segui»). */
  const profileGridHairline = (
    <div
      aria-hidden
      className="pointer-events-none mt-8 mb-10 h-[2px] w-full rounded-full sm:mt-10"
      style={PROFILE_GRID_WHITE_HAIRLINE}
    />
  );

  const renderFollowButton = (fullWidth: boolean, compact = false) => (
    <button
      type="button"
      onClick={toggleFollow}
      aria-pressed={followingAuthor}
      aria-label={
        followingAuthor ? `Già in seguito: ${persona.name}. Clicca per smettere di seguire` : `Segui ${persona.name}`
      }
      className={[
        "group relative inline-flex items-center justify-center overflow-hidden font-semibold transition-[transform,box-shadow,background-color,border-color] duration-200 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--background-primary))]",
        fullWidth
          ? "min-h-[44px] w-full rounded-xl px-10 py-2.5 text-[13px] tracking-[0.05em]"
          : compact
            ? "h-[30px] min-h-[30px] min-w-[7rem] shrink-0 whitespace-nowrap rounded-lg px-3 text-[11px] leading-none tracking-normal sm:min-w-0 sm:px-[14px] sm:text-[12px]"
            : "min-h-[46px] min-w-[9rem] shrink-0 justify-center rounded-xl px-10 py-2.5 text-[13px] tracking-[0.05em]",
        followingAuthor
          ? "border border-white/[0.14] bg-white/[0.05] text-white/[0.92] hover:bg-white/[0.09] focus-visible:ring-white/25"
          : "border border-white/[0.12] text-white focus-visible:ring-primary/35",
      ].join(" ")}
      style={
        followingAuthor
          ? undefined
          : {
              boxShadow:
                fullWidth
                  ? `0 18px 56px -18px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : compact
                    ? `0 6px 24px -12px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
                    : `0 18px 56px -18px ${accent.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
            }
      }
    >
      {!followingAuthor ? (
        <span
          aria-hidden
          className="absolute inset-0 opacity-[0.42]"
          style={{
            background: `linear-gradient(118deg, ${accent.glow}, transparent 58%)`,
          }}
        />
      ) : null}
      {!followingAuthor ? (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-70"
        />
      ) : null}
      <span className="relative z-[1]">{followingAuthor ? "Segui già" : "Segui"}</span>
    </button>
  );

  return (
    <div className="min-h-screen" style={{ background: "rgb(var(--background-primary))" }}>
      <Header showCategoryStrip={false} />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.42]"
        style={{
          background: `radial-gradient(52% 38% at 50% -4%, ${accent.glow} 0%, transparent 72%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-4 pb-32 pt-5">
        <BackLink
          href="/news"
          className="inline-flex min-h-[40px] items-center rounded-xl text-white/45 hover:text-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 mb-7"
        >
          <svg className="mr-1.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">News</span>
        </BackLink>

        <section className="relative mb-0">
          {/* Header profilo — ritmo e tipo come Instagram web */}
          <div className="flex flex-row items-start gap-4 sm:gap-9">
            <div className="shrink-0">
              <AvatarImageLightbox
                src={persona.avatar}
                name={persona.name}
                sizeClass="h-[88px] w-[88px] sm:h-[112px] sm:w-[112px]"
                triggerStyle={{
                  border: `1px solid ${accent.cardBorder}`,
                  boxShadow: `0 0 40px -14px ${accent.glow}`,
                }}
                className="focus-visible:ring-offset-[rgb(var(--background-primary))]"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col pt-px">
              {/* Riga username + azione: allineamento preciso come IG */}
              {/* Nome allineato allo stesso asse sinistro della colonna "post" sotto */}
              <div className="flex min-h-[30px] flex-row items-center gap-x-3 gap-y-1">
                <h1 className="min-w-0 flex-1 truncate text-left font-sans text-[15px] font-semibold leading-none tracking-normal text-white">
                  {persona.name}
                </h1>
                <div className="hidden shrink-0 flex-col items-end sm:flex">
                  {renderFollowButton(false, true)}
                </div>
              </div>

              {/* Statistiche: spaziatura fissa sotto il nome */}
              <div className="mt-[11px] flex flex-row justify-start gap-5 sm:gap-6 md:gap-7">
                <div className="min-w-[4rem] text-left sm:min-w-[4.5rem]">
                  <p className="font-sans text-[1rem] font-semibold tabular-nums leading-none tracking-tight text-white sm:text-[1.0625rem]">
                    {postsFormatted}
                  </p>
                  <p className="mt-1.5 font-sans text-[12px] leading-none tracking-wide text-white/55">post</p>
                </div>
                <div className="min-w-[4rem] text-left sm:min-w-[4.5rem]">
                  <p className="font-sans text-[1rem] font-semibold tabular-nums leading-none tracking-tight text-white sm:text-[1.0625rem]">
                    {followersFormatted}
                  </p>
                  <p className="mt-1.5 font-sans text-[12px] leading-none tracking-wide text-white/55">follower</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <p
            className={`${bioBody.className} mt-7 w-full max-w-none text-left text-[0.9rem] font-normal leading-[1.72] tracking-[0.01em] text-white/[0.72] antialiased sm:text-[0.9375rem] sm:leading-[1.74]`}
          >
            {authorBio}
          </p>

          <div className="mt-8 flex flex-col items-stretch sm:hidden">
            {renderFollowButton(true)}
          </div>
        </section>

        {profileGridHairline}

        {loading ? (
          <div className="mt-0">
            <NewsAuthorPostGridSkeleton count={8} />
          </div>
        ) : articles.length === 0 ? (
          <div className="relative overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(80,245,252,0.06),transparent_70%)]"
            />
            <p
              className="relative text-[1.25rem] font-bold tracking-[-0.022em] text-white"
              style={{ fontFamily: "var(--font-kalshi-title)" }}
            >
              Nessun articolo in questa categoria
            </p>
            <p className="relative mt-2 text-[13px] text-white/40">Torna tra poco · Pubblichiamo spesso</p>
          </div>
        ) : (
          <>
            <div className="mt-0">
              <NewsAuthorPostGrid
                articles={articles.map((a) => ({
                  id: a.id,
                  slug: a.slug,
                  title: a.title,
                  format: a.format,
                  imageUrl: a.imageUrl,
                  excerpt: a.excerpt,
                  body: a.body,
                }))}
              />
            </div>

            {page < totalPages ? (
              <div className="mt-10 flex justify-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={() => load(page + 1, true)}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.1] bg-white/[0.04] px-8 py-3.5 text-[13px] font-semibold tracking-tight text-white transition-[border-color,background-color,transform] duration-200 hover:border-white/[0.16] hover:bg-white/[0.07] active:scale-[0.99] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45"
                >
                  <span className="relative z-[1]">{loadingMore ? "Carico…" : "Carica altri"}</span>
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${accent.glow}, transparent)`,
                    }}
                  />
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
