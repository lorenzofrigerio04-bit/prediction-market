"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getYesNoPct } from "@/lib/feed/yes-no-pct";
import { getCategoryImagePath, getCategoryFallbackGradient } from "@/lib/category-slug";
import { FeedCardActions } from "./FeedCardActions";

const PREDICTIONS_POLL_INTERVAL_MS = 15_000;

export interface FeedCardAIImageEvent {
  id: string;
  title: string;
  category: string;
  probability?: number | null;
  predictionsCount?: number;
}

export interface FeedCardAIImageProps {
  post: {
    id: string;
    content: string | null;
    aiImageUrl: string | null;
    createdAt?: string;
    user: { id: string; name: string | null; image: string | null };
  };
  event: FeedCardAIImageEvent;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onRepost?: () => void;
  onFollow?: () => void;
  onShare?: () => void;
  onRefreshFeed?: () => void;
  compact?: boolean;
}

function ImagePlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function formatRelativeTime(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const m = Math.floor(diff / 60_000);
  const h = Math.floor(diff / 3600_000);
  const g = Math.floor(diff / 86400_000);
  if (m < 1) return "ora";
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (g < 7) return `${g}g`;
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export function FeedCardAIImage({
  post,
  event,
  likeCount,
  commentCount,
  isLiked = false,
  onLike,
  onComment,
  onRepost,
  onShare,
  onRefreshFeed,
  compact = false,
}: FeedCardAIImageProps) {
  const hasAiImage = Boolean(post.aiImageUrl?.trim());
  const categoryImagePath = getCategoryImagePath(event.category?.trim() || "Cultura");
  const fallbackGradient = getCategoryFallbackGradient(event.category?.trim() || "Cultura");
  const [categoryImageFailed, setCategoryImageFailed] = useState(false);
  const useCategoryFallback = !hasAiImage && categoryImagePath && !categoryImageFailed;

  const displayName = post.user.name?.trim() || "Utente";
  const avatarUrl =
    post.user.image?.trim() ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.user.id)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const [livePredictionsCount, setLivePredictionsCount] = useState(
    () => event.predictionsCount ?? 0
  );
  const [commentExpanded, setCommentExpanded] = useState(false);

  useEffect(() => {
    if (hasAiImage) return;
    fetch("/api/ai/generate-event-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id }),
    }).catch(() => {});
    const t = setTimeout(() => onRefreshFeed?.(), 50_000);
    return () => clearTimeout(t);
  }, [post.id, hasAiImage, onRefreshFeed]);

  useEffect(() => {
    const eventId = event.id;
    const fetchCount = () => {
      fetch(`/api/events/${eventId}/predictions-count`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && typeof data.predictionsCount === "number") {
            setLivePredictionsCount(data.predictionsCount);
          }
        })
        .catch(() => {});
    };
    fetchCount();
    const t = setInterval(fetchCount, PREDICTIONS_POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [event.id]);

  const predictionsCount = event.predictionsCount ?? 0;
  const { yes: yesPct } = getYesNoPct(event.probability ?? null, predictionsCount);
  const categoryLabel = event.category?.trim() || "Evento";
  const timeStr = post.createdAt ? formatRelativeTime(post.createdAt) : "";

  const content = post.content?.trim();

  return (
    <article
      className={`lente-post relative overflow-hidden ${compact ? "rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-white/[0.03]" : ""}`}
      aria-label={`Post: ${content || event.title}`}
    >
      {/* X-style: Avatar + Nome + tempo in riga */}
      <div className={`flex items-start gap-3 ${compact ? "p-3" : "p-4"}`}>
        <Link
          href={`/profile/${post.user.id}`}
          className="shrink-0 rounded-full ring-1 ring-black/5 dark:ring-white/10 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`Profilo di ${displayName}`}
        >
          <img
            src={avatarUrl}
            alt=""
            className={`object-cover ${compact ? "h-9 w-9" : "h-11 w-11"}`}
          />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0">
            <span className={`font-semibold text-fg truncate ${compact ? "text-sm" : "text-[15px]"}`}>
              {displayName}
            </span>
            {timeStr && (
              <span className="text-fg-muted text-[13px]">· {timeStr}</span>
            )}
          </div>

          {/* Commento: protagonista del post — analisi dell'autore */}
          {content ? (
            <p
              className={`mt-1.5 text-fg whitespace-pre-wrap break-words leading-[1.5] ${compact ? "text-sm" : "text-[15px]"} ${commentExpanded ? "" : compact ? "line-clamp-2" : "line-clamp-4"}`}
            >
              {content}
            </p>
          ) : (
            <p className="mt-1.5 text-fg-muted text-sm italic">Condivide un evento</p>
          )}
          {content && content.length > (compact ? 80 : 180) && (
            <button
              type="button"
              onClick={() => setCommentExpanded((e) => !e)}
              className="mt-1 text-[13px] font-medium text-primary hover:underline"
            >
              {commentExpanded ? "Mostra meno" : "Leggi tutto"}
            </button>
          )}
        </div>
      </div>

      {/* Immagine in evidenza — valorizzata, look premium */}
      <Link
        href={`/events/${event.id}`}
        className={`lente-event-visual block mx-4 mb-4 overflow-hidden rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-neutral-100 dark:bg-neutral-900/50 transition-all duration-200 hover:border-black/[0.1] dark:hover:border-white/[0.12] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] ${compact ? "aspect-[16/9] min-h-[140px]" : "aspect-[16/9] min-h-[200px] sm:min-h-[240px]"}`}
      >
        {/* Immagine full-width, hero */}
        <div className="relative w-full h-full">
          {hasAiImage ? (
            <img
              src={post.aiImageUrl!}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : useCategoryFallback ? (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ background: fallbackGradient }}
              />
              <img
                src={categoryImagePath}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setCategoryImageFailed(true)}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-300 dark:bg-neutral-700">
              <ImagePlaceholderIcon className="h-10 w-10 text-neutral-500 dark:text-neutral-400" />
            </div>
          )}
          {/* Overlay bottom: titolo, categoria, barra — leggibile su qualsiasi immagine */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <span className="inline-block mb-1.5 rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-sm">
              {categoryLabel}
            </span>
            <h3 className={`font-semibold text-white leading-snug drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] ${compact ? "text-sm line-clamp-1" : "text-base sm:text-lg line-clamp-2"}`}>
              {event.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <div
                className="flex h-2 flex-1 min-w-0 overflow-hidden rounded-full bg-white/20 backdrop-blur-sm"
                role="presentation"
              >
                <div
                  className="h-full shrink-0 rounded-l-full bg-gradient-to-r from-teal-400 to-teal-500"
                  style={{ width: `${yesPct}%` }}
                />
                <div
                  className="h-full shrink-0 rounded-r-full bg-gradient-to-r from-rose-400 to-rose-500"
                  style={{ width: `${100 - yesPct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-white/90 tabular-nums shrink-0">
                {livePredictionsCount} previsioni
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Action bar: community al centro */}
      <FeedCardActions
        likeCount={likeCount}
        commentCount={commentCount}
        isLiked={isLiked}
        onLike={onLike}
        onComment={onComment}
        onRepost={onRepost}
        onShare={onShare}
      />
    </article>
  );
}
