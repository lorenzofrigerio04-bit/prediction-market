"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { LoadingBlock, EmptyState } from "@/components/ui";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { PublishCommentModal } from "@/components/feed/PublishCommentModal";
import { PostCommentsDrawer } from "@/components/feed/PostCommentsDrawer";
import type { FeedPost } from "@/types/feed";

const FEED_PAGE_SIZE = 10;

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repostModalEventId, setRepostModalEventId] = useState<string | null>(null);
  const [repostLoading, setRepostLoading] = useState(false);
  const [commentsDrawerPostId, setCommentsDrawerPostId] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const deepLinkAppliedRef = useRef(false);

  useEffect(() => {
    if (!shareToast) return;
    const t = setTimeout(() => setShareToast(false), 2000);
    return () => clearTimeout(t);
  }, [shareToast]);

  const fetchPosts = useCallback(
    async (append = false) => {
      const offset = append ? posts.length : 0;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/feed/posts?limit=${FEED_PAGE_SIZE}&offset=${offset}&type=AI_IMAGE`
        );
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const message = data.detail
            ? `${data.error}: ${data.detail}`
            : data.error || "Errore di caricamento";
          throw new Error(message);
        }
        const data = await res.json();
        const next = (data.posts ?? []) as FeedPost[];
        if (append) {
          setPosts((prev) => [...prev, ...next]);
        } else {
          setPosts(next);
        }
        setHasMore(data.hasMore === true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Errore di rete");
        if (!append) setPosts([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [posts.length]
  );

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
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Errore");
        setRepostModalEventId(null);
        fetchPosts(false);
      } catch (e) {
        console.error(e);
        throw e;
      } finally {
        setRepostLoading(false);
      }
    },
    [repostModalEventId, fetchPosts]
  );

  const handleLike = useCallback(async (postId: string) => {
    if (!session) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Errore");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                likeCount: data.likeCount ?? p.likeCount,
                isLikedByCurrentUser: data.isLiked ?? false,
              }
            : p
        )
      );
    } catch (e) {
      console.error("Like error:", e);
    }
  }, [session]);

  const handleCommentCountUpdate = useCallback((postId: string, count: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, commentCount: count } : p))
    );
  }, []);

  const handleFollow = useCallback(async (eventId: string) => {
    if (!session) return;
    try {
      await fetch(`/api/events/${eventId}/follow`, { method: "POST" });
      // Optional: show brief "Seguito" feedback; Step 7 does not require isFollowing in card
    } catch (e) {
      console.error("Follow error:", e);
    }
  }, [session]);

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
    fetchPosts(false);
  }, []);

  /** Deep link: /discover?postId=xxx — dopo il primo caricamento, apri il drawer commenti per quel post se presente nella lista. */
  useEffect(() => {
    if (loading || posts.length === 0 || deepLinkAppliedRef.current) return;
    const postId = searchParams.get("postId");
    if (!postId) return;
    if (posts.some((p) => p.id === postId)) {
      deepLinkAppliedRef.current = true;
      setCommentsDrawerPostId(postId);
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, [loading, posts, searchParams]);

  /** Infinite scroll: sentinel in fondo, carica altra pagina quando entra in view. */
  useEffect(() => {
    if (!hasMore || loadingMore || loading || posts.length === 0) return;
    const sentinel = loadMoreRef.current;
    if (!sentinel) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchPosts(true);
      },
      { rootMargin: "200px", threshold: 0 }
    );
    io.observe(sentinel);
    return () => io.disconnect();
  }, [hasMore, loadingMore, loading, posts.length, fetchPosts]);

  return (
    <div className="min-h-screen discover-page">
      <Header />

      <main
        id="main-content"
        className="relative mx-auto px-4 sm:px-6 py-5 md:py-8 max-w-2xl pb-[calc(5rem+var(--safe-area-inset-bottom))]"
      >
        <h1 className="sr-only">Feed eventi</h1>

        {loading ? (
          <LoadingBlock message="Caricamento feed…" />
        ) : error ? (
          <EmptyState
            title="Errore"
            description={error}
            action={{ label: "Riprova", onClick: () => fetchPosts(false) }}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            title="Nessun post"
            description="Non ci sono ancora post nel feed."
          />
        ) : (
          <>
            <ul className="flex flex-col gap-4 list-none p-0 m-0" role="feed" aria-label="Feed eventi">
              {posts
                .filter((post) => post.type === "AI_IMAGE")
                .map((post) => (
                <li key={post.id}>
                  <FeedPostCard
                    post={post}
                    onLike={session ? handleLike : undefined}
                    onComment={(postId) => setCommentsDrawerPostId(postId)}
                    onRepost={session ? (eventId) => setRepostModalEventId(eventId) : undefined}
                    onFollow={session ? handleFollow : undefined}
                    onShare={handleShare}
                  />
                </li>
              ))}

            </ul>
            <div ref={loadMoreRef} className="min-h-[1px]" aria-hidden />
            {loadingMore && (
              <div className="flex justify-center py-6">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </>
        )}
      </main>

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
    </div>
  );
}
