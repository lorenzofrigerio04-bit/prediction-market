import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import BackLink from "@/components/ui/BackLink";
import { AvatarImageLightbox } from "@/components/ui/AvatarImageLightbox";
import { NewsArticleViewTracker } from "@/components/news/NewsArticleViewTracker";
import type { NewsFormat } from "@/lib/news-engine/types";
import {
  FORMAT_ACCENT,
  formatArticleKindLabel,
  PERSONA_AVATARS,
  PERSONA_DISPLAY_NAME,
  timeAgo,
} from "@/lib/news-article-ui";
import { RelatedNewsRail } from "@/components/news/RelatedNewsRail";
import { getRelatedNewsArticles, relatedArticleToSerializable } from "@/lib/news-related";
import { getNewsArticleDisplaySource, syncNewsArticleSourceLabels } from "@/lib/news-engine";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const article = await prisma.newsArticle.findFirst({
    where: { slug, published: true },
    select: { title: true, excerpt: true },
  });
  if (!article) return { title: "News" };
  return {
    title: `${article.title} · News`,
    description: article.excerpt,
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  await syncNewsArticleSourceLabels();
  const article = await prisma.newsArticle.findFirst({
    where: { slug, published: true },
    select: {
      id: true,
      category: true,
      format: true,
      title: true,
      subtitle: true,
      body: true,
      authorPersona: true,
      imageUrl: true,
      readingTimeMin: true,
      publishedAt: true,
      sourceLabel: true,
      sourceUrls: true,
    },
  });
  if (!article) notFound();

  const relatedItems = (
    await getRelatedNewsArticles(
      {
        id: article.id,
        category: article.category,
        format: article.format,
        authorPersona: article.authorPersona,
      },
      5
    )
  ).map(relatedArticleToSerializable);

  const format = article.format as NewsFormat;
  const accent = FORMAT_ACCENT[format];
  const displayName = PERSONA_DISPLAY_NAME[article.authorPersona] ?? article.authorPersona;
  const avatarSrc = PERSONA_AVATARS[article.authorPersona];
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const paragraphs = article.body.split("\n").filter((p) => p.trim());
  const displaySource = getNewsArticleDisplaySource({
    sourceLabel: article.sourceLabel,
    sourceUrls: article.sourceUrls,
  });

  return (
    <div className="min-h-screen" style={{ background: "rgb(var(--background-primary))" }}>
      <NewsArticleViewTracker articleId={article.id} />
      <Header showCategoryStrip={false} />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.5]"
        style={{
          background: `radial-gradient(55% 36% at 50% -6%, ${accent.glow} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-xl px-4 pb-32 pt-3">
        <BackLink
          href="/news"
          className="inline-flex items-center min-h-[40px] text-white/45 hover:text-white/85 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 mb-5"
        >
          <svg className="w-5 h-5 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium text-sm">Indietro</span>
        </BackLink>

        <article lang="it">
          <div className="flex gap-3.5">
            {avatarSrc ? (
              <AvatarImageLightbox
                src={avatarSrc}
                name={displayName}
                sizeClass="h-12 w-12"
                triggerStyle={{
                  border: `2px solid ${accent.cardBorder}`,
                  boxShadow: `0 0 28px -6px ${accent.glow}`,
                }}
                className="focus-visible:ring-offset-[rgb(var(--background-primary))]"
              />
            ) : (
              <div
                className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold text-white"
                style={{
                  border: `2px solid ${accent.cardBorder}`,
                  boxShadow: `0 0 28px -6px ${accent.glow}`,
                  background: accent.glow,
                }}
                aria-hidden
              >
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-[15px] font-semibold tracking-tight text-white">{displayName}</span>
                <span className="text-[13px] text-white/28">·</span>
                <time className="text-[13px] text-white/38" dateTime={article.publishedAt.toISOString()}>
                  {timeAgo(article.publishedAt)}
                </time>
                <span className="text-[13px] text-white/28">·</span>
                <span className="text-[13px] text-white/38">{article.readingTimeMin} min lettura</span>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  className={`news-format-badge inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] ${accent.labelColor}`}
                >
                  <span className={`h-1 w-1 shrink-0 rounded-full ${accent.dot}`} />
                  {formatArticleKindLabel(format)}
                </span>
              </div>
            </div>
          </div>

          <header className="mt-8">
            <h1
              className="text-[1.62rem] font-bold leading-[1.1] tracking-[-0.022em] text-white sm:text-[1.9rem]"
              style={{ fontFamily: "var(--font-kalshi-title)" }}
            >
              {article.title}
            </h1>
            {article.subtitle ? (
              <p className="mt-3.5 text-[1.02rem] leading-snug text-white/44">{article.subtitle}</p>
            ) : null}
            <div className="relative mt-8 w-full" aria-hidden>
              <div
                className="h-px w-full"
                style={{
                  background: accent.topBar,
                  boxShadow: `0 0 22px -2px ${accent.glow}, 0 0 1px rgba(255,255,255,0.06)`,
                }}
              />
            </div>
          </header>

          {article.imageUrl ? (
            <div
              className="relative mt-9 overflow-hidden rounded-2xl border border-white/[0.07]"
              style={{ boxShadow: `0 28px 56px -32px ${accent.glow}` }}
            >
              <Image
                src={article.imageUrl}
                alt=""
                width={900}
                height={500}
                className="aspect-[16/10] w-full object-cover"
                priority
              />
            </div>
          ) : null}

          <div
            className="font-sans mx-auto mt-11 max-w-[33rem] space-y-6 selection:bg-primary/20 selection:text-white sm:mt-12 sm:space-y-7 antialiased"
          >
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-[1.05rem] font-normal leading-[1.72] tracking-[0.01em] text-white/[0.9] sm:flow-root sm:text-[1.125rem] sm:leading-[1.68] sm:first-letter:float-left sm:first-letter:mr-3 sm:first-letter:mt-0.5 sm:first-letter:font-semibold sm:first-letter:text-[2.4rem] sm:first-letter:leading-[0.76] sm:first-letter:tracking-[-0.02em] sm:first-letter:text-white"
                    : "text-[0.9875rem] font-normal leading-[1.84] tracking-[0.012em] text-white/[0.82] sm:text-[1.025rem] sm:leading-[1.86]"
                }
              >
                {p}
              </p>
            ))}
          </div>

          <footer className="mx-auto mt-7 max-w-[33rem] sm:mt-8">
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span
                className="text-[0.8125rem] font-medium leading-snug text-white/55"
                style={{
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.02em",
                }}
              >
                Fonte:
              </span>
              <span
                className="font-sans text-[13px] font-light tracking-[0.04em] text-white/[0.48] antialiased"
              >
                {displaySource}
              </span>
            </p>
          </footer>

          <RelatedNewsRail items={relatedItems} />
        </article>
      </div>
    </div>
  );
}
