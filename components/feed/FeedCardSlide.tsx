"use client";

import Link from "next/link";
import { getBackdropClass } from "@/components/discover/ConsigliatiFeed";
import { getYesNoPct } from "@/lib/feed/yes-no-pct";
import { FeedCardActions } from "./FeedCardActions";

export interface FeedCardSlideEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  probability: number | null;
  predictionsCount?: number;
}

export interface FeedCardSlideProps {
  post: {
    id: string;
    user: { id: string; name: string | null; image: string | null };
  };
  event: FeedCardSlideEvent;
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onRepost?: () => void;
  onFollow?: () => void;
  onShare?: () => void;
}

export function FeedCardSlide({
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
}: FeedCardSlideProps) {
  const descriptionShort =
    event.description?.replace(/\s+/g, " ").trim().slice(0, 120) ?? "";
  const hasMoreDesc = (event.description?.length ?? 0) > 120;
  const predictionsCount = event.predictionsCount ?? 0;
  const { yes: yesPct } = getYesNoPct(event.probability, predictionsCount);
  const displayName = post.user.name?.trim() || "Utente";
  const initial = displayName.charAt(0).toUpperCase() || "?";

  return (
    <article
      className="relative w-full overflow-hidden rounded-2xl border border-black/15 dark:border-white/15 bg-black/5 dark:bg-black/20"
      aria-label={`Evento: ${event.title}`}
    >
      {/* Slide area: quasi full-viewport height */}
      <div
        className="relative flex min-h-[70vh] flex-col justify-end overflow-hidden"
        style={{ minHeight: "min(70vh, 480px)" }}
      >
        <div className={getBackdropClass(event.category)} aria-hidden />
        <div className="consigliati-slide-content relative z-10 flex flex-1 flex-col justify-end px-4 pb-4 pt-6 md:px-4 md:pb-4 md:pt-6">
          <div className="consigliati-slide-badges flex flex-col items-start gap-2">
            <span className="consigliati-badge rounded-lg border border-white/15 bg-black/20 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] min-h-[28px] inline-flex items-center">
              {event.category}
            </span>
            <span className="consigliati-badge rounded-lg border border-white/15 bg-black/20 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] tabular-nums min-h-[28px] inline-flex items-center">
              {predictionsCount} previsioni
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-0">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-black/40 text-sm font-bold text-white backdrop-blur-sm">
                {post.user.image ? (
                  <img
                    src={post.user.image}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <span className="truncate text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {displayName}
              </span>
            </div>
            <Link
              href={`/events/${event.id}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg"
            >
              <h2 className="text-base font-bold leading-snug text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] line-clamp-3">
                {event.title}
              </h2>
            </Link>
            {descriptionShort && (
              <p className="mt-1 text-sm text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2">
                {descriptionShort}
                {hasMoreDesc ? "…" : ""}
              </p>
            )}
            <div
              className="consigliati-yesno-bar mt-1.5 h-2 w-full overflow-hidden rounded-full"
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
            <Link
              href={`/events/${event.id}`}
              className="mt-1.5 inline-block text-xs font-semibold text-primary drop-shadow-sm hover:underline"
            >
              Vai all&apos;evento →
            </Link>
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
