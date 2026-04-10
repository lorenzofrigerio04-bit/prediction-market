"use client";

import { useRef, useEffect } from "react";
import HomeEventTile from "./HomeEventTile";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { LoadingBlock, EmptyState } from "@/components/ui";
import { getEventProbability } from "@/lib/pricing/price-display";
import type { HomeEventTileData } from "./HomeCarouselBox";
import type { HomeEventTileVariant } from "./HomeEventTile";
import type { FeedPost } from "@/types/feed";

export type HomeFeedItem =
  | { type: "event"; data: HomeFeedEventData }
  | { type: "post"; data: FeedPost };

export interface HomeFeedEventData {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  probability: number;
  q_yes?: number | null;
  q_no?: number | null;
  b?: number | null;
  _count?: { predictions: number };
  aiImageUrl?: string | null;
  marketType?: string | null;
  outcomes?: Array<{ key: string; label: string }> | null;
  outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null;
}

function eventToTileData(e: HomeFeedEventData): HomeEventTileData {
  const yesPct =
    e.q_yes != null && e.q_no != null && e.b != null
      ? Math.round(getEventProbability({ q_yes: e.q_yes, q_no: e.q_no, b: e.b }))
      : Math.round(e.probability ?? 50);
  return {
    id: e.id,
    title: e.title,
    category: e.category,
    closesAt: e.closesAt,
    yesPct,
    predictionsCount: e._count?.predictions,
    aiImageUrl: e.aiImageUrl,
    marketType: e.marketType,
    outcomes: e.outcomes,
    outcomeProbabilities: e.outcomeProbabilities,
  };
}

/** Pattern casuali per layout unificato tipo Instagram: [post|2eventi], [2eventi|post], [post|evento], [evento|post], [2eventi], [2post] */
const ROW_PATTERNS = [
  "post-left", // [Post | Event, Event]
  "post-right", // [Event, Event | Post]
  "post-event", // [Post | Event]
  "event-post", // [Event | Post]
  "events-2", // [Event | Event]
  "posts-2", // [Post | Post] (solo post, es. feed discover)
] as const;

export interface HomeFeedProps {
  items: HomeFeedItem[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore?: () => void;
  onEventNavigate?: () => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onRepost?: (eventId: string) => void;
  onFollow?: (eventId: string) => void;
  onShare?: (eventId: string) => void;
  onRefreshFeed?: () => void;
  isAuthenticated?: boolean;
  variant?: HomeEventTileVariant;
  filterEvent?: (title: string) => boolean;
  getDisplayTitle?: (title: string) => string;
}

export function HomeFeed({
  items,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onEventNavigate,
  onLike,
  onComment,
  onRepost,
  onFollow,
  onShare,
  onRefreshFeed,
  isAuthenticated = false,
  variant = "popular",
  filterEvent = () => true,
  getDisplayTitle = (t) => t,
}: HomeFeedProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const lastLoadMoreRef = useRef(0);
  const LOAD_MORE_DEBOUNCE_MS = 800;

  useEffect(() => {
    if (!hasMore || loadingMore || loading || items.length === 0 || !onLoadMore)
      return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        const now = Date.now();
        if (now - lastLoadMoreRef.current < LOAD_MORE_DEBOUNCE_MS) return;
        lastLoadMoreRef.current = now;
        onLoadMore();
      },
      { rootMargin: "300px", threshold: 0 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, loadingMore, loading, items.length, onLoadMore]);

  if (loading) {
    return <LoadingBlock message="Caricamento feed…" />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nessun contenuto"
        description="Non ci sono ancora eventi o post nel feed."
      />
    );
  }

  const filtered = items.filter((item) => {
    if (item.type === "event") return filterEvent(item.data.title);
    return true;
  });

  const events: HomeFeedEventData[] = [];
  const posts: FeedPost[] = [];
  for (const item of filtered) {
    if (item.type === "event") events.push(item.data);
    else if (item.data.type === "AI_IMAGE") posts.push(item.data);
  }

  let ei = 0;
  let pi = 0;

  const consumeEvent = (): HomeFeedEventData | null =>
    ei < events.length ? events[ei++] : null;
  const consumePost = (): FeedPost | null =>
    pi < posts.length ? posts[pi++] : null;

  const rows: Array<{
    pattern: (typeof ROW_PATTERNS)[number];
    left: "post" | "event" | "events";
    right: "post" | "event" | "events";
    leftPost?: FeedPost;
    leftEvents?: HomeFeedEventData[];
    rightPost?: FeedPost;
    rightEvents?: HomeFeedEventData[];
  }> = [];

  for (let i = 0; i < 50; i++) {
    const pattern = ROW_PATTERNS[i % ROW_PATTERNS.length];

    switch (pattern) {
      case "posts-2": {
        if (pi + 2 > posts.length) break;
        const leftPost = consumePost()!;
        const rightPost = consumePost()!;
        rows.push({
          pattern,
          left: "post",
          right: "post",
          leftPost,
          rightPost,
        });
        break;
      }
      case "post-left": {
        if (pi >= posts.length || ei + 2 > events.length) break;
        const leftPost = consumePost()!;
        const rightEvents = [consumeEvent()!, consumeEvent()!];
        rows.push({
          pattern,
          left: "post",
          right: "events",
          leftPost,
          rightEvents,
        });
        break;
      }
      case "post-right": {
        if (ei + 2 > events.length || pi >= posts.length) break;
        const leftEvents = [consumeEvent()!, consumeEvent()!];
        const rightPost = consumePost()!;
        rows.push({
          pattern,
          left: "events",
          right: "post",
          leftEvents,
          rightPost,
        });
        break;
      }
      case "post-event": {
        if (pi >= posts.length || ei >= events.length) break;
        const leftPost = consumePost()!;
        const re = consumeEvent()!;
        rows.push({
          pattern,
          left: "post",
          right: "event",
          leftPost,
          rightEvents: [re],
        });
        break;
      }
      case "event-post": {
        if (ei >= events.length || pi >= posts.length) break;
        const le = consumeEvent()!;
        const rightPost = consumePost()!;
        rows.push({
          pattern,
          left: "event",
          right: "post",
          leftEvents: [le],
          rightPost,
        });
        break;
      }
      case "events-2": {
        if (ei + 2 > events.length) break;
        const e1 = consumeEvent()!;
        const e2 = consumeEvent()!;
        rows.push({
          pattern,
          left: "event",
          right: "event",
          leftEvents: [e1],
          rightEvents: [e2],
        });
        break;
      }
    }

    if (ei >= events.length && pi >= posts.length) break;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="Nessun contenuto"
        description="Non ci sono ancora eventi o post nel feed."
      />
    );
  }

  const renderEventTile = (e: HomeFeedEventData, compact: boolean) => {
    const tile = eventToTileData(e);
    return (
      <HomeEventTile
        key={e.id}
        id={tile.id}
        title={getDisplayTitle(tile.title)}
        category={tile.category}
        closesAt={tile.closesAt}
        yesPct={tile.yesPct}
        predictionsCount={tile.predictionsCount}
        variant={variant}
        onNavigate={onEventNavigate}
        compact={compact}
        imageUrl={tile.aiImageUrl}
        marketType={tile.marketType}
        outcomes={tile.outcomes}
        outcomeProbabilities={tile.outcomeProbabilities}
      />
    );
  };

  const renderPost = (post: FeedPost, useCompact?: boolean) => (
    <FeedPostCard
      key={post.id}
      post={post}
      compact={useCompact}
      onLike={isAuthenticated ? onLike : undefined}
      onComment={onComment}
      onRepost={isAuthenticated ? onRepost : undefined}
      onFollow={isAuthenticated ? onFollow : undefined}
      onShare={onShare}
      onRefreshFeed={onRefreshFeed}
    />
  );

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {rows.map((row, idx) => {
        const isTallRow =
          row.pattern === "post-left" ||
          row.pattern === "post-right" ||
          row.pattern === "posts-2";
        const rowHeight = isTallRow ? "min-h-[420px] sm:min-h-[460px]" : "min-h-[220px] sm:min-h-[260px]";

        return (
          <div
            key={`row-${idx}-${row.pattern}`}
            className={`grid grid-cols-[1fr_1fr] gap-2 sm:gap-3 ${rowHeight} items-stretch`}
          >
            {/* Colonna sinistra: stessa larghezza della destra */}
            <div className="min-h-full flex flex-col overflow-hidden rounded-2xl">
              {row.left === "post" && row.leftPost && (
                <div className="flex-1 min-h-0 flex flex-col">
                  {renderPost(row.leftPost, !isTallRow)}
                </div>
              )}
              {row.left === "events" && row.leftEvents && row.leftEvents.length === 2 && (
                <div className="grid grid-rows-[1fr_1fr] gap-0.5 flex-1 min-h-0 h-full">
                  {row.leftEvents.map((e) => (
                    <div key={e.id} className="min-h-0 h-full flex flex-col overflow-hidden rounded-2xl">
                      {renderEventTile(e, true)}
                    </div>
                  ))}
                </div>
              )}
              {row.left === "event" && row.leftEvents?.[0] && (
                <div className="flex-1 min-h-0 rounded-2xl overflow-hidden">
                  {renderEventTile(row.leftEvents[0], true)}
                </div>
              )}
            </div>

            {/* Colonna destra: 2 eventi occupano esattamente metà altezza ciascuno, zero spazi */}
            <div className="min-h-full flex flex-col overflow-hidden rounded-2xl">
              {row.right === "post" && row.rightPost && (
                <div className="flex-1 min-h-0 flex flex-col">
                  {renderPost(row.rightPost, !isTallRow)}
                </div>
              )}
              {row.right === "events" && row.rightEvents && row.rightEvents.length === 2 && (
                <div className="grid grid-rows-[1fr_1fr] gap-0.5 flex-1 min-h-0 h-full">
                  {row.rightEvents.map((e) => (
                    <div key={e.id} className="min-h-0 h-full flex flex-col overflow-hidden rounded-2xl">
                      {renderEventTile(e, true)}
                    </div>
                  ))}
                </div>
              )}
              {row.right === "event" && row.rightEvents?.[0] && (
                <div className="flex-1 min-h-0 rounded-2xl overflow-hidden">
                  {renderEventTile(row.rightEvents[0], true)}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={loadMoreRef} className="min-h-[1px]" aria-hidden />
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
