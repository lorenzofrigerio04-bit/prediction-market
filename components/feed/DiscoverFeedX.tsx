"use client";

import { useRef, useEffect } from "react";
import { FeedPostCard } from "./FeedPostCard";
import { LoadingBlock, EmptyState } from "@/components/ui";
import type { HomeFeedItem } from "@/components/home/HomeFeed";
import type { FeedPost } from "@/types/feed";

export interface DiscoverFeedXProps {
  items: HomeFeedItem[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore?: () => void;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onRepost?: (eventId: string) => void;
  onFollow?: (eventId: string) => void;
  onShare?: (eventId: string) => void;
  onRefreshFeed?: () => void;
  isAuthenticated?: boolean;
}

/** Feed X-style: colonna singola, un post per riga, full width (come Twitter/X). */
export function DiscoverFeedX({
  items,
  loading,
  hasMore,
  loadingMore,
  onLoadMore,
  onLike,
  onComment,
  onRepost,
  onFollow,
  onShare,
  onRefreshFeed,
  isAuthenticated = false,
}: DiscoverFeedXProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || loadingMore || loading || items.length === 0 || !onLoadMore)
      return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore();
      },
      { rootMargin: "200px", threshold: 0 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, loadingMore, loading, items.length, onLoadMore]);

  if (loading) {
    return <LoadingBlock message="Caricamento feed…" />;
  }

  const posts = items.filter(
    (item): item is { type: "post"; data: FeedPost } =>
      item.type === "post" && item.data.type === "AI_IMAGE"
  );

  if (posts.length === 0) {
    return (
      <EmptyState
        title="Nessun contenuto"
        description="Non ci sono ancora eventi o post nel feed."
      />
    );
  }

  return (
    <div className="flex flex-col divide-y divide-black/[0.04] dark:divide-white/[0.06]">
      {posts.map((item) => (
        <div key={item.data.id} className="py-5 first:pt-0">
          <FeedPostCard
            post={item.data}
            compact={false}
            onLike={isAuthenticated ? onLike : undefined}
            onComment={onComment}
            onRepost={isAuthenticated ? onRepost : undefined}
            onFollow={isAuthenticated ? onFollow : undefined}
            onShare={onShare}
            onRefreshFeed={onRefreshFeed}
          />
        </div>
      ))}
      <div ref={loadMoreRef} className="min-h-[1px]" aria-hidden />
      {loadingMore && (
        <div className="flex justify-center py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
