"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getYesNoPct } from "@/lib/feed/yes-no-pct";
import { FeedCardActions } from "./FeedCardActions";

const PREDICTIONS_POLL_INTERVAL_MS = 15_000;

export interface FeedCardAIImageEvent {
  id: string;
  title: string;
  category: string;
  probability?: number | null;
  predictionsCount?: number;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

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

export function FeedCardAIImage({
  post,
  event,
  likeCount,
  commentCount,
  isLiked = false,
  onLike,
  onComment,
  onRepost,
  onFollow,
  onShare,
}: FeedCardAIImageProps) {
  const hasImage = Boolean(post.aiImageUrl?.trim());
  const createdAtMs = post.createdAt ? new Date(post.createdAt).getTime() : 0;
  const isRecent = createdAtMs > 0 && Date.now() - createdAtMs < ONE_HOUR_MS;
  const showGenerating = !hasImage && isRecent;

  const displayName = post.user.name?.trim() || "Utente";
  const avatarUrl =
    post.user.image?.trim() ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.user.id)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

  const [livePredictionsCount, setLivePredictionsCount] = useState(
    () => event.predictionsCount ?? 0
  );
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentExpanded, setCommentExpanded] = useState(false);
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

  const handleFollowClick = () => {
    onFollow?.();
    setIsFollowing(true);
  };

  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-white/40 dark:border-white/15 bg-white/40 dark:bg-white/5 backdrop-blur-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
      aria-label={`Post: ${event.title}`}
    >
      {/* Header: identità + azione (una riga chiara) */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700 ring-1 ring-black/5 dark:ring-white/10">
            <img
              src={avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          <span className="min-w-0 truncate text-[15px] font-semibold text-fg">
            {displayName}
          </span>
        </div>
        {onFollow && (
          <button
            type="button"
            onClick={handleFollowClick}
            className="flex shrink-0 items-center gap-1.5 rounded-full py-2 px-3 text-sm font-medium text-primary hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
            aria-label={isFollowing ? "Seguito" : "Segui evento"}
          >
            {isFollowing ? (
              <svg className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            )}
            <span>{isFollowing ? "Seguito" : "Segui"}</span>
          </button>
        )}
      </div>

      {/* Commento: spazio dedicato, "Leggi tutto" per espandere (testo sempre completo quando espanso) */}
      {post.content?.trim() && (
        <div className="px-4 pb-4 pt-0 overflow-visible">
          <p
            className={`text-[15px] leading-[1.55] text-fg whitespace-pre-wrap break-words ${commentExpanded ? "" : "line-clamp-4"}`}
          >
            {post.content.trim()}
          </p>
          <button
            type="button"
            onClick={() => setCommentExpanded((e) => !e)}
            className="mt-1 text-sm font-medium text-primary hover:underline"
          >
            {commentExpanded ? "Mostra meno" : "Leggi tutto"}
          </button>
        </div>
      )}

      {/* Separatore sottile prima della foto */}
      <div className="border-b border-black/8 dark:border-white/10" aria-hidden />

      {/* Blocco 2: Evento — sfumature sul bordo box foto ↔ box commento e box titolo */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        {hasImage ? (
          <>
            <img
              src={post.aiImageUrl!}
              alt=""
              className="h-full w-full object-cover"
            />
            {/* Sfumatura bordo superiore: box commento → box foto (stesso colore card) */}
            <div
              className="absolute inset-x-0 top-0 h-16 pointer-events-none bg-gradient-to-b from-white/40 to-transparent dark:from-white/5"
              aria-hidden
            />
            {/* Sfumatura bordo inferiore: box foto → box titolo (stesso colore card) */}
            <div
              className="absolute inset-x-0 bottom-0 h-16 pointer-events-none bg-gradient-to-t from-white/40 to-transparent dark:from-white/5"
              aria-hidden
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-300 dark:bg-neutral-700 px-4">
            <ImagePlaceholderIcon className="h-12 w-12 text-neutral-500 dark:text-neutral-400" />
            {showGenerating && (
              <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                Immagine in generazione…
              </p>
            )}
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        <Link
          href={`/events/${event.id}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-lg"
        >
          <h2 className="text-lg font-bold leading-tight text-fg line-clamp-2">
            {event.title}
          </h2>
        </Link>
        <div
          className="prediction-bar-led h-2.5 w-full overflow-hidden rounded-full"
          role="presentation"
          aria-hidden
        >
          <div className="flex h-full w-full">
            <div
              className="prediction-bar-fill-si h-full shrink-0 transition-[width] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]"
              style={{ width: `${yesPct}%` }}
            />
            <div
              className="prediction-bar-fill-no h-full shrink-0 transition-[width] duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]"
              style={{ width: `${100 - yesPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            href={`/events/${event.id}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Vai all&apos;evento →
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="rounded-lg border border-black/20 dark:border-white/20 bg-transparent px-2.5 py-1 text-xs font-semibold text-fg"
              aria-label={`Categoria: ${categoryLabel}`}
            >
              {categoryLabel}
            </span>
            <span
              className="rounded-lg border border-black/20 dark:border-white/20 bg-transparent px-2.5 py-1 text-xs font-semibold tabular-nums text-fg"
              aria-label={`${livePredictionsCount} previsioni`}
            >
              {livePredictionsCount} previsioni
            </span>
          </div>
        </div>
      </div>

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
