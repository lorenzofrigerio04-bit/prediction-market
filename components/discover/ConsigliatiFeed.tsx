"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { categoryToSlug } from "@/lib/category-slug";
import { IconChat, IconClose } from "@/components/ui/Icons";
import CommentsSection from "@/components/CommentsSection";

const DRAWER_CLOSE_MS = 420;

/** Drawer commenti stile TikTok: pannello dal basso, handle, chiudi chiaro, animazioni fluide */
function CommentsDrawer({
  eventId,
  onClose,
}: {
  eventId: string;
  onClose: () => void;
}) {
  const [entered, setEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(t);
  }, []);

  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    window.setTimeout(onClose, DRAWER_CLOSE_MS);
  }, [closing, onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) close();
  };

  const panelClass =
    closing
      ? "comments-drawer-panel closing"
      : entered
        ? "comments-drawer-panel open"
        : "comments-drawer-panel entering";

  const backdropClass =
    closing
      ? "comments-drawer-backdrop closing"
      : entered
        ? "comments-drawer-backdrop open"
        : "comments-drawer-backdrop entering";

  return (
    <div
      className={`fixed inset-0 z-50 ${backdropClass}`}
      role="dialog"
      aria-modal="true"
      aria-label="Commenti"
      onClick={handleBackdropClick}
    >
      <div
        ref={panelRef}
        className={`${panelClass} absolute bottom-0 left-0 right-0 flex flex-col bg-bg pb-[env(safe-area-inset-bottom)]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle + header compatti: resta chiaro che siamo nel feed */}
        <div className="flex flex-shrink-0 flex-col items-center pt-3 pb-1.5">
          <div className="h-0.5 w-9 shrink-0 rounded-full bg-white/20" aria-hidden />
        </div>
        <div className="flex flex-shrink-0 items-center justify-between gap-3 px-4 pb-3">
          <h2 className="text-base font-semibold text-fg">Commenti</h2>
          <button
            type="button"
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-fg hover:bg-white/20 active:scale-95 transition-colors"
            aria-label="Chiudi"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
        <div className="comments-drawer-scroll px-5 pt-1 pb-6">
          <CommentsSection eventId={eventId} variant="embedded" />
        </div>
      </div>
    </div>
  );
}

const LIKES_STORAGE_KEY = "consigliati-likes";

/** Nomi profilo realistici (nomi e nickname) per autori evento */
const DISPLAY_AUTHORS: { name: string; initial: string }[] = [
  { name: "Marco R.", initial: "M" },
  { name: "Chiara", initial: "C" },
  { name: "Luca", initial: "L" },
  { name: "Sofia", initial: "S" },
  { name: "Alessandro", initial: "A" },
  { name: "Giovanni", initial: "G" },
  { name: "Elena", initial: "E" },
  { name: "Davide", initial: "D" },
  { name: "Francesca", initial: "F" },
  { name: "Matteo", initial: "M" },
  { name: "Laura", initial: "L" },
  { name: "Stefano", initial: "S" },
  { name: "Valentina", initial: "V" },
  { name: "Andrea", initial: "A" },
  { name: "Giulia", initial: "G" },
  { name: "Federico", initial: "F" },
  { name: "Martina", initial: "M" },
  { name: "Lorenzo", initial: "L" },
];

const SYSTEM_AUTHOR_PATTERN = /event\s*generator|sistema|bot|admin|generatore|\(sistema\)/i;

function getDisplayAuthor(eventId: string, createdBy: { name: string | null; image: string | null } | null) {
  let n = 0;
  for (let i = 0; i < eventId.length; i++) n = (n * 31 + eventId.charCodeAt(i)) >>> 0;
  const idx = n % DISPLAY_AUTHORS.length;
  const author = DISPLAY_AUTHORS[idx];
  const realName = createdBy?.name?.trim();
  if (realName && !SYSTEM_AUTHOR_PATTERN.test(realName)) {
    return { name: realName, initial: realName.charAt(0).toUpperCase() || author.initial, useRealImage: true };
  }
  return { ...author, useRealImage: false };
}

const TAP_MOVE_THRESHOLD_PX = 18;
const TAP_MAX_DURATION_MS = 400;

/** Area centrale della slide: tap apre evento, scroll non attiva il link */
function ConsigliatiSlideCenterTap({ eventId }: { eventId: string }) {
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.targetTouches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      e.preventDefault();
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = t.clientY - touchStart.current.y;
      const duration = Date.now() - touchStart.current.t;
      touchStart.current = null;
      if (duration <= TAP_MAX_DURATION_MS && Math.hypot(dx, dy) <= TAP_MOVE_THRESHOLD_PX) {
        window.location.href = `/events/${eventId}`;
      }
    },
    [eventId]
  );
  return (
    <Link
      href={`/events/${eventId}`}
      className="consigliati-slide-center-tap absolute left-1/2 top-1/2 z-[1] flex h-[50%] w-[70%] max-w-[320px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl md:pointer-events-auto"
      style={{ pointerEvents: "auto" }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={() => { touchStart.current = null; }}
      aria-label="Apri evento"
    />
  );
}

/** Percentuali SÌ/NO: 50/50 se nessuna previsione */
function getYesNoPct(probability: number | undefined | null, predictionsCount: number): { yes: number; no: number } {
  if (predictionsCount === 0) return { yes: 50, no: 50 };
  const p = typeof probability === "number" && Number.isFinite(probability) ? probability : 50;
  return { yes: Math.round(p), no: Math.round(100 - p) };
}

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

export function getBackdropClass(category: string): string {
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
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
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
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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

function IconShare({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

interface ConsigliatiSlideProps {
  event: ConsigliatiEvent;
  liked: boolean;
  onLikeToggle: () => void;
  onOpenComments: () => void;
  onFollowToggle: () => void;
  onShare: () => void;
}

function ConsigliatiSlide({
  event,
  liked,
  onLikeToggle,
  onOpenComments,
  onFollowToggle,
  onShare,
}: ConsigliatiSlideProps) {
  const descriptionShort =
    event.description?.replace(/\s+/g, " ").trim().slice(0, 120) ?? "";
  const hasMoreDesc = (event.description?.length ?? 0) > 120;
  const displayAuthor = getDisplayAuthor(event.id, event.createdBy);
  const predictionsCount = event._count.predictions ?? 0;
  const { yes: yesPct, no: noPct } = getYesNoPct(event.probability, predictionsCount);

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
      {/* Tap centro foto: vai a evento (solo se tap netto, non scroll) */}
      <ConsigliatiSlideCenterTap eventId={event.id} />
      <div className="consigliati-slide-content relative z-10 flex h-full flex-col justify-between px-4 pb-[calc(4rem+var(--safe-area-inset-bottom))] pl-[max(1rem,var(--safe-area-inset-left))] pr-[max(1rem,var(--safe-area-inset-right))] md:pb-6 md:pl-4 md:pr-4 pt-[calc(var(--header-height,3.5rem)+52px)] md:pt-4">
        {/* Categoria e numero previsioni: a sinistra, uno sotto l'altro, allineati al titolo */}
        <div className="consigliati-slide-badges mt-5 flex flex-col items-start gap-2">
          <span className="consigliati-badge rounded-lg border border-white/15 bg-black/20 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] min-h-[28px] inline-flex items-center">
            {event.category}
          </span>
          <span className="consigliati-badge rounded-lg border border-white/15 bg-black/20 px-2.5 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] tabular-nums min-h-[28px] inline-flex items-center">
            {predictionsCount} previsioni
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Autore: avatar (iniziale o foto reale) + nome sempre dal pool se sistema */}
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-black/40 text-sm font-bold text-white backdrop-blur-sm">
                {"useRealImage" in displayAuthor && displayAuthor.useRealImage && event.createdBy?.image ? (
                  <img
                    src={event.createdBy.image}
                    alt=""
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  displayAuthor.initial
                )}
              </div>
              <span className="truncate text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {displayAuthor.name}
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
            {/* Barra SÌ/NO dinamica (verde/rosso) con contorno LED neon leggero */}
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
          {/* Barra destra stile TikTok: icona + numero, compatta; mb per separazione dalla bottom nav */}
          <div className="consigliati-actions flex flex-shrink-0 flex-col items-center gap-4 pr-0 mb-12 md:mb-10">
            <button
              type="button"
              onClick={onLikeToggle}
              className="flex flex-col items-center gap-0.5 text-white transition-transform active:scale-95"
              aria-label={liked ? "Rimuovi mi piace" : "Mi piace"}
            >
              <IconHeart filled={liked} className="h-8 w-8 drop-shadow-md" />
              <span className="text-[10px] font-medium drop-shadow-sm">Mi piace</span>
            </button>
            <button
              type="button"
              onClick={onOpenComments}
              className="flex flex-col items-center gap-0.5 text-white transition-transform active:scale-95"
              aria-label="Commenti"
            >
              <IconChat className="h-8 w-8 drop-shadow-md" />
              <span className="text-[10px] font-medium drop-shadow-sm">{event._count.comments}</span>
            </button>
            <button
              type="button"
              onClick={onShare}
              className="flex flex-col items-center gap-0.5 text-white transition-transform active:scale-95"
              aria-label="Condividi"
            >
              <IconShare className="h-8 w-8 drop-shadow-md" />
              <span className="text-[10px] font-medium drop-shadow-sm">Condividi</span>
            </button>
            <button
              type="button"
              onClick={onFollowToggle}
              className="flex flex-col items-center gap-0.5 text-white transition-transform active:scale-95"
              aria-label={event.isFollowing ? "Non seguire più" : "Segui evento"}
            >
              <IconUserPlus className="h-8 w-8 drop-shadow-md" />
              <span className="text-[10px] font-medium drop-shadow-sm">
                {event.isFollowing ? "Seguito" : "Segui"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

const CONSIGLIATI_PAGE_SIZE = 30;

export interface ConsigliatiFeedProps {
  /** Chiamato quando cambia la slide visibile; usato per lo sfondo full-viewport (stessa foto dietro header/tab/strip). */
  onSlideChange?: (backdropClass: string) => void;
}

export default function ConsigliatiFeed({ onSlideChange }: ConsigliatiFeedProps) {
  const { data: session } = useSession();
  const [events, setEvents] = useState<ConsigliatiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(getStoredLikes);
  const [commentsEventId, setCommentsEventId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasMore(true);
    try {
      const res = await fetch(
        `/api/events/consigliati?limit=${CONSIGLIATI_PAGE_SIZE}&offset=0`
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Errore di caricamento");
      }
      const data = await res.json();
      setEvents(data.events ?? []);
      setHasMore(data.pagination?.hasMore ?? false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore di rete");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || events.length === 0) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/events/consigliati?limit=${CONSIGLIATI_PAGE_SIZE}&offset=${events.length}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const next = data.events ?? [];
      const seen = new Set(events.map((e) => e.id));
      const newEvents = next.filter((e: ConsigliatiEvent) => !seen.has(e.id));
      setEvents((prev) => [...prev, ...newEvents]);
      setHasMore(data.pagination?.hasMore ?? false);
    } finally {
      setLoadingMore(false);
    }
  }, [events.length, hasMore, loadingMore]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  /** Scroll infinito: carica altra pagina quando si è vicini alla fine (ultime 2 slide). */
  useEffect(() => {
    if (!hasMore || loadingMore || events.length === 0) return;
    if (currentIndex >= events.length - 2) loadMore();
  }, [currentIndex, events.length, hasMore, loadingMore, loadMore]);

  useEffect(() => {
    setLikedIds(getStoredLikes());
  }, []);

  /* Drawer commenti aperto: nascondi "-passa alla pagina originale-" */
  useEffect(() => {
    if (commentsEventId) document.body.classList.add("consigliati-comments-open");
    else document.body.classList.remove("consigliati-comments-open");
    return () => document.body.classList.remove("consigliati-comments-open");
  }, [commentsEventId]);

  /** Quando torni sulla pagina dopo un po': refetch per feed sempre vivo (evita refetch ad ogni tab switch) */
  const hiddenAtRef = useRef<number | null>(null);
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
      } else if (document.visibilityState === "visible" && hiddenAtRef.current !== null) {
        const hiddenFor = Date.now() - hiddenAtRef.current;
        if (hiddenFor > 8000) fetchEvents();
        hiddenAtRef.current = null;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [fetchEvents]);

  const handleShare = useCallback((eventId: string, title: string) => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/events/${eventId}`
        : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title, url }).catch(() => {
        navigator.clipboard?.writeText(url);
      });
    } else {
      navigator.clipboard?.writeText(url);
    }
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

  /* Sfondo full-viewport: notifica la slide corrente così la stessa foto sta dietro header/tab/strip */
  useEffect(() => {
    if (!onSlideChange || events.length === 0) return;
    const idx = Math.max(0, Math.min(currentIndex, events.length - 1));
    const category = events[idx]?.category ?? "Sport";
    onSlideChange(getBackdropClass(category));
  }, [currentIndex, events, onSlideChange]);

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
            onShare={() => handleShare(event.id, event.title)}
          />
        ))}
        {loadingMore && (
          <div
            className="flex flex-shrink-0 items-center justify-center py-8"
            style={{ minHeight: "120px" }}
            aria-hidden
          >
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      {commentsEventId && (
        <CommentsDrawer
          eventId={commentsEventId}
          onClose={() => setCommentsEventId(null)}
        />
      )}
    </>
  );
}
