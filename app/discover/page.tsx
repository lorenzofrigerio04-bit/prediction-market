"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { DiscoverFeedX } from "@/components/feed/DiscoverFeedX";
import type { HomeFeedItem } from "@/components/home/HomeFeed";
import { EmptyState } from "@/components/ui";
import { PublishCommentModal } from "@/components/feed/PublishCommentModal";
import { PostCommentsDrawer } from "@/components/feed/PostCommentsDrawer";

const FEED_PAGE_SIZE = 20;

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [items, setItems] = useState<HomeFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repostModalEventId, setRepostModalEventId] = useState<string | null>(null);
  const [repostLoading, setRepostLoading] = useState(false);
  const [commentsDrawerPostId, setCommentsDrawerPostId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const deepLinkAppliedRef = useRef(false);

  useEffect(() => {
    if (!shareToast) return;
    const t = setTimeout(() => setShareToast(false), 2000);
    return () => clearTimeout(t);
  }, [shareToast]);

  const fetchFeed = useCallback(async (offset = 0) => {
    const append = offset > 0;
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/feed/discover?limit=${FEED_PAGE_SIZE}&offset=${offset}`);
      if (!res.ok) throw new Error("Errore di caricamento");
      const data = await res.json();
      const next = (data.items ?? []) as HomeFeedItem[];
      if (append) {
        setItems((prev) => [...prev, ...next]);
      } else {
        setItems(next);
      }
      setHasMore(data.hasMore === true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di rete");
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(0);
  }, [fetchFeed]);

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
        fetchFeed(0);
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        setRepostLoading(false);
      }
    },
    [repostModalEventId, fetchFeed]
  );

  const handleLike = useCallback(async (postId: string) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setItems((prev) =>
        prev.map((p) =>
          p.type === "post" && p.data.id === postId
            ? { ...p, data: { ...p.data, likeCount: data.likeCount ?? p.data.likeCount, isLikedByCurrentUser: data.isLiked ?? false } }
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
        p.type === "post" && p.data.id === postId ? { ...p, data: { ...p.data, commentCount: count } } : p
      )
    );
  }, []);

  const handleShare = useCallback(async (eventId: string) => {
    try {
      const url = `${typeof window !== "undefined" ? window.location.origin : ""}/events/${eventId}`;
      await navigator.clipboard.writeText(url);
      setShareToast(true);
    } catch (e) {
      console.error("Share error:", e);
    }
  }, []);

  useEffect(() => {
    if (loading || items.length === 0 || deepLinkAppliedRef.current) return;
    const postId = searchParams.get("postId");
    if (!postId) return;
    if (items.some((p) => p.type === "post" && p.data.id === postId)) {
      deepLinkAppliedRef.current = true;
      setCommentsDrawerPostId(postId);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [loading, items, searchParams]);

  return (
    <div className="min-h-screen discover-page bg-[rgb(var(--bg))]">
      <Header />

      <main
        id="main-content"
        className="relative mx-auto max-w-2xl pb-[calc(5rem+var(--safe-area-inset-bottom))] md:pb-8"
      >
        <div className="px-4 sm:px-6 py-4 md:py-6" role="feed" aria-label="Post della community">
          {error ? (
          <EmptyState
            title="Errore"
            description={error}
            action={{ label: "Riprova", onClick: () => fetchFeed(0) }}
          />
        ) : (
          <DiscoverFeedX
            items={items}
            loading={loading}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={() => fetchFeed(items.length)}
            onRefreshFeed={() => fetchFeed(0)}
            onLike={session ? handleLike : undefined}
            onComment={(postId) => setCommentsDrawerPostId(postId)}
            onRepost={session ? (eventId) => setRepostModalEventId(eventId) : undefined}
            onFollow={async () => {}}
            onShare={handleShare}
            isAuthenticated={!!session}
          />
        )}
        </div>

        <PublishCommentModal
          isOpen={repostModalEventId !== null}
          onClose={() => setRepostModalEventId(null)}
          onSubmit={handleRepostSubmit}
          title="Ripubblica con commento"
          submitLabel="Ripubblica"
          loading={repostLoading}
        />

        <PostCommentsDrawer
          postId={commentsDrawerPostId}
          isOpen={commentsDrawerPostId !== null}
          onClose={() => setCommentsDrawerPostId(null)}
          onCommentCountUpdate={handleCommentCountUpdate}
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
      </main>
    </div>
  );
}
