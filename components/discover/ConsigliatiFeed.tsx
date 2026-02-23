"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { categoryToSlug } from "@/lib/category-slug";
import { IconChat, IconClose } from "@/components/ui/Icons";
import CommentsSection from "@/components/CommentsSection";

const LIKES_STORAGE_KEY = "consigliati-likes";

export interface ConsigliatiEvent {
  id: string;
  title: string;
  description: string | null;
  category: string;
  closesAt: string;
  probability: number;
  createdBy: { id: string; name: string | null; image: string | null };
  _count: { predictions: number; comments: number };
  isFollowing: boolean;
  fomo?: {
    countdownMs: number;
    participantsCount: number;
    votesVelocity: number;
    pointsMultiplier: number;
    isClosingSoon: boolean;
  };
}

function getBackdropClass(category: string): string {
  const slug = categoryToSlug(category);
  const allowed = [
    "cultura",
    "economia",
    "intrattenimento",
    "sport",
    "tecnologia",
    "scienza",
    "politica",
  ];
  const modifier = allowed.includes(slug) ? slug : "default";
  return `consigliati-slide-backdrop consigliati-slide-backdrop--${modifier}`;
}

function preloadCategoryImage(category: string) {
  const slug = categoryToSlug(category);
  const allowed = [
    "cultura",
    "economia",
    "intrattenimento",
    "sport",
    "tecnologia",
    "scienza",
    "politica",
  ];
  const name = allowed.includes(slug) ? slug : "intrattenimento";
  const img = new Image();
  img.src = `/images/event-${name}-bg.png`;
}

function getStoredLikes(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LIKES_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function setStoredLikes(ids: Set<string>) {
  try {
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

function IconHeart({ filled, className }: { filled: boolean; className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function IconUserPlus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}

interface ConsigliatiSlideProps {
  event: ConsigliatiEvent;
  liked: boolean;
  onLikeToggle: () => void;
  onOpenComments: () => void;
  onFollowToggle: () => void;
}

function ConsigliatiSlide({
  event,
  liked,
  onLikeToggle,
  onOpenComments,
  onFollowToggle,
}: ConsigliatiSlideProps) {
  const descriptionShort =
    event.description?.replace(/\s+/g, " ").trim().slice(0, 120) ?? "";
  const hasMoreDesc = (event.description?.length ?? 0) > 120;

  return (
    <section
      className="consigliati-slide relative w-full flex-shrink-0 overflow-hidden h-full"
      style={{
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
        height: "100%",
      }}
      aria-label={`Evento: ${event.title}`}
    >
      <div className={getBackdropClass(event.category)} aria-hidden />
      <div className="consigliati-slide-content relative z-10 flex h-full flex-col justify-between px-4 pt-4 pb-[calc(4rem+var(--safe-area-inset-bottom))] pl-[max(1rem,var(--safe-area-inset-left))] pr-[max(1rem,var(--safe-area-inset-right))] md:pb-6 md:pl-4 md:pr-4">
        <div className="flex justify-end gap-2" />
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href={`/events/${event.id}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-lg"
            >
              <h2 className="text-lg font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] line-clamp-2 leading-snug">
                {event.title}
              </h2>
            </Link>
            {descriptionShort && (
              <p className="mt-1 text-sm text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] line-clamp-2">
                {descriptionShort}
                {hasMoreDesc ? "…" : ""}
              </p>
            )}
            <Link
              href={`/events/${event.id}`}
              className="mt-2 inline-block text-xs font-semibold text-primary drop-shadow-sm hover:underline"
            >
              Vai all&apos;evento →
            </Link>
          </div>
          <div className="consigliati-actions flex flex-shrink-0 flex-col items-center gap-5 pr-0">
            <button
              type="button"
              onClick={onLikeToggle}
              className="flex flex-col items-center gap-0.5 text-white transition-transform active:scale-95"
              aria-label={liked ? "Rimuovi mi piace" : "Mi piace"}
            >
              <IconHeart filled={liked} className="h-9 w-9 drop-shadow-md" />
              <span className="text-xs font-medium drop-shadow-sm">
                {liked ? "Cuore" : "Mi piace"}
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenComments}
              className="flex flex-col items-center gap-0.5 text-white transition-transform active:scale-95"
              aria-label="Commenti"
            >
              <IconChat className="h-9 w-9 drop-shadow-md" />
              <span className="text-xs font-medium drop-shadow-sm">
                {event._count.comments}
              </span>
            </button>
            <button
              type="button"
              onClick={onFollowToggle}
              className="flex flex-col items-center gap-0.5 text-white transition-transform active:scale-95"
              aria-label={event.isFollowing ? "Non seguire più" : "Segui evento"}
            >
              <IconUserPlus className="h-9 w-9 drop-shadow-md" />
              <span className="text-xs font-medium drop-shadow-sm">
                {event.isFollowing ? "Seguito" : "Segui"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function ConsigliatiFeed() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<ConsigliatiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(getStoredLikes);
  const [commentsEventId, setCommentsEventId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/events/consigliati?limit=30");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Errore di caricamento");
      }
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di rete");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    setLikedIds(getStoredLikes());
  }, []);

  const handleLikeToggle = useCallback((eventId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) next.delete(eventId);
      else next.add(eventId);
      setStoredLikes(next);
      return next;
    });
  }, []);

  const handleFollowToggle = useCallback(
    async (eventId: string) => {
      if (!session?.user?.id) return;
      const event = events.find((e) => e.id === eventId);
      if (!event) return;
      const prev = event.isFollowing;
      setEvents((list) =>
        list.map((e) =>
          e.id === eventId ? { ...e, isFollowing: !e.isFollowing } : e
        )
      );
      try {
        const res = await fetch(`/api/events/${eventId}/follow`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Errore");
        setEvents((list) =>
          list.map((e) =>
            e.id === eventId ? { ...e, isFollowing: data.isFollowing } : e
          )
        );
      } catch {
        setEvents((list) =>
          list.map((e) =>
            e.id === eventId ? { ...e, isFollowing: prev } : e
          )
        );
      }
    },
    [session?.user?.id, events]
  );

  useEffect(() => {
    if (events.length === 0) return;
    const idx = Math.max(0, Math.min(currentIndex, events.length - 1));
    const next = events[idx + 1];
    const prev = events[idx - 1];
    if (next) preloadCategoryImage(next.category);
    if (prev) preloadCategoryImage(prev.category);
  }, [currentIndex, events]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const h = el.clientHeight;
      const i = Math.round(el.scrollTop / h);
      setCurrentIndex(Math.max(0, Math.min(i, events.length - 1)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [events.length]);

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-16"
        style={{ height: "var(--consigliati-feed-height, calc(100dvh - 7.75rem))" }}
      >
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
          aria-hidden
        />
        <p className="text-ds-body text-fg-muted font-medium">
          Caricamento consigliati…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
        style={{ height: "var(--consigliati-feed-height, calc(100dvh - 7.75rem))" }}
      >
        <p className="text-ds-body text-fg-muted">{error}</p>
        <button
          type="button"
          onClick={() => fetchEvents()}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-hover transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center"
        style={{ height: "var(--consigliati-feed-height, calc(100dvh - 7.75rem))" }}
      >
        <p className="text-ds-body text-fg-muted">
          Nessun evento consigliato al momento.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="consigliati-feed overflow-y-auto overflow-x-hidden overscroll-y-contain scroll-smooth"
        style={{
          height: "var(--consigliati-feed-height, calc(100dvh - 7.75rem))",
          scrollSnapType: "y mandatory",
          WebkitOverflowScrolling: "touch",
        }}
        role="feed"
        aria-label="Eventi consigliati"
      >
        {events.map((event) => (
          <ConsigliatiSlide
            key={event.id}
            event={event}
            liked={likedIds.has(event.id)}
            onLikeToggle={() => handleLikeToggle(event.id)}
            onOpenComments={() => setCommentsEventId(event.id)}
            onFollowToggle={() => handleFollowToggle(event.id)}
          />
        ))}
      </div>

      {commentsEventId && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-bg"
          role="dialog"
          aria-modal="true"
          aria-label="Commenti"
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="text-ds-h3 font-bold text-fg">Commenti</h2>
            <button
              type="button"
              onClick={() => setCommentsEventId(null)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-fg-muted hover:bg-surface/50 hover:text-fg transition-colors"
              aria-label="Chiudi"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <CommentsSection eventId={commentsEventId} variant="embedded" />
          </div>
        </div>
      )}
    </>
  );
}
