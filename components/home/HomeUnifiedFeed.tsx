"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import HomeEventTile from "./HomeEventTile";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { LoadingBlock, EmptyState } from "@/components/ui";
import { PostCommentsDrawer } from "@/components/feed/PostCommentsDrawer";
import { PublishCommentModal } from "@/components/feed/PublishCommentModal";
import type { UnifiedFeedItem, LentePost, SistemaEvent } from "@/types/home-unified-feed";
import type { FeedPost } from "@/types/feed";

export interface HomeUnifiedFeedProps {
  onEventNavigate?: () => void;
}

function lenteToFeedPost(l: LentePost): FeedPost {
  return {
    id: l.id,
    type: "AI_IMAGE",
    content: l.content,
    aiImageUrl: l.aiImageUrl,
    createdAt: l.createdAt,
    user: l.user,
    event: {
      id: l.event.id,
      title: l.event.title,
      description: null,
      category: l.event.category,
      closesAt: l.event.closesAt,
      probability: l.event.probability,
      resolved: null,
      outcome: null,
      totalCredits: null,
      predictionsCount: l.event.predictionsCount,
    },
    likeCount: l.likeCount,
    commentCount: l.commentCount,
    isLikedByCurrentUser: l.isLikedByCurrentUser,
  };
}

export function HomeUnifiedFeed({ onEventNavigate }: HomeUnifiedFeedProps) {
  const { data: session } = useSession();
  const [items, setItems] = useState<UnifiedFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentsDrawerPostId, setCommentsDrawerPostId] = useState<string | null>(null);
  const [repostModalEventId, setRepostModalEventId] = useState<string | null>(null);
  const [repostLoading, setRepostLoading] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/feed/home-unified");
      if (!res.ok) throw new Error("Errore di caricamento");
      const data = await res.json();
      setItems((data.items ?? []) as UnifiedFeedItem[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di rete");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (!shareToast) return;
    const t = setTimeout(() => setShareToast(false), 2000);
    return () => clearTimeout(t);
  }, [shareToast]);

  const handleLike = useCallback(async (postId: string) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setItems((prev) =>
        prev.map((p) =>
          p.type === "lente" && p.data.id === postId
            ? {
                ...p,
                data: {
                  ...p.data,
                  likeCount: data.likeCount ?? p.data.likeCount,
                  isLikedByCurrentUser: data.isLiked ?? false,
                },
              }
            : p
        )
      );
    } catch (e) {
      console.error("Like error:", e);
    }
  }, [session]);

  const handleCommentCountUpdate = useCallback((postId: string, count: number) => {
    setItems((prev) =>
      prev.map((p) =>
        p.type === "lente" && p.data.id === postId
          ? { ...p, data: { ...p.data, commentCount: count } }
          : p
      )
    );
  }, []);

  const handleRepostSubmit = useCallback(
    async (content: string) => {
      if (!repostModalEventId) return;
      setRepostLoading(true);
      try {
        const res = await fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: repostModalEventId,
            content: content.trim() || undefined,
            source: "REPOST",
          }),
        });
        if (!res.ok) throw new Error("Errore");
        setRepostModalEventId(null);
        fetchFeed();
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        setRepostLoading(false);
      }
    },
    [repostModalEventId, fetchFeed]
  );

  const handleShare = useCallback(async (eventId: string) => {
    try {
      const url = `${typeof window !== "undefined" ? window.location.origin : ""}/events/${eventId}`;
      await navigator.clipboard.writeText(url);
      setShareToast(true);
    } catch (e) {
      console.error("Share error:", e);
    }
  }, []);

  if (loading) {
    return <LoadingBlock message="Caricamento feed…" />;
  }

  if (error) {
    return (
      <EmptyState
        title="Errore"
        description={error}
        action={{ label: "Riprova", onClick: fetchFeed }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nessun contenuto"
        description="Non ci sono ancora eventi nel feed."
      />
    );
  }

  // Raggruppa item consecutivi: sistema in grid 2-col, lente full-width
  type Block = { type: "sistema"; events: SistemaEvent[] } | { type: "lente"; post: LentePost };
  const blocks: Block[] = [];
  let i = 0;
  while (i < items.length) {
    if (items[i].type === "sistema") {
      const sistemaBatch: SistemaEvent[] = [];
      while (i < items.length && items[i].type === "sistema") {
        sistemaBatch.push((items[i] as { type: "sistema"; data: SistemaEvent }).data);
        i++;
      }
      blocks.push({ type: "sistema", events: sistemaBatch });
    } else {
      const lenteData = (items[i] as { type: "lente"; data: LentePost }).data;
      blocks.push({ type: "lente", post: lenteData });
      i++;
    }
  }

  return (
    <>
      <div
        className="flex flex-col gap-6"
        role="feed"
        aria-label="Feed eventi: Sistema e Lente"
      >
        {blocks.map((block, bi) => {
          if (block.type === "sistema") {
            return (
              <div
                key={`sistema-block-${bi}`}
                className="grid grid-cols-2 gap-3 sm:gap-4"
              >
                {block.events.map((e) => (
                  <HomeEventTile
                    key={e.id}
                    id={e.id}
                    title={e.title}
                    category={e.category}
                    closesAt={e.closesAt}
                    yesPct={e.yesPct}
                    predictionsCount={e.predictionsCount}
                    variant="popular"
                    onNavigate={onEventNavigate}
                    compact={true}
                    imageUrl={e.aiImageUrl}
                  />
                ))}
              </div>
            );
          }
          const post = lenteToFeedPost(block.post);
          return (
            <div key={`lente-${post.id}`}>
              <FeedPostCard
                post={post}
                compact={false}
                onLike={session ? handleLike : undefined}
                onComment={(id) => setCommentsDrawerPostId(id)}
                onRepost={session ? (eventId) => setRepostModalEventId(eventId) : undefined}
                onFollow={undefined}
                onShare={handleShare}
                onRefreshFeed={fetchFeed}
              />
            </div>
          );
        })}
      </div>

      <PostCommentsDrawer
        postId={commentsDrawerPostId}
        isOpen={commentsDrawerPostId !== null}
        onClose={() => setCommentsDrawerPostId(null)}
        onCommentCountUpdate={handleCommentCountUpdate}
      />

      <PublishCommentModal
        isOpen={repostModalEventId !== null}
        onClose={() => setRepostModalEventId(null)}
        onSubmit={handleRepostSubmit}
        title="Ripubblica con commento"
        submitLabel="Ripubblica"
        loading={repostLoading}
      />

      {shareToast && (
        <div
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[1001] px-4 py-2 rounded-xl bg-fg text-bg text-sm font-medium shadow-lg animate-in fade-in duration-200"
          role="status"
          aria-live="polite"
        >
          Link copiato
        </div>
      )}
    </>
  );
}
