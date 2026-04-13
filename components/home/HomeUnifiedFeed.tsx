"use client";

import { useState, useEffect, useCallback, useMemo, useRef, type TouchEvent } from "react";
import Link from "next/link";
import HomeEventTile from "./HomeEventTile";
import { EmptyState, LoadingBlock } from "@/components/ui";
import { getCategoryFallbackGradient, categoryToSlug } from "@/lib/category-slug";
import { MARKET_CATEGORIES, type MarketCategoryId } from "@/lib/market-categories";
import {
  deriveOutcomesFromTitle,
  isMarketTypeId,
  MULTI_OPTION_MARKET_TYPES,
  parseOutcomesJson,
} from "@/lib/market-types";

export interface HomeUnifiedFeedProps {
  onEventNavigate?: () => void;
  endpoint?: string;
  featuredTitle?: string;
  feedTitle?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  layout?: "netflix" | "classic";
}
const HOME_UNIFIED_REFRESH_MS = 30_000;

interface UnifiedHomeEvent {
  id: string;
  title: string;
  category: string;
  closesAt: string;
  yesPct: number;
  predictionsCount?: number;
  totalCredits?: number;
  aiImageUrl?: string | null;
  marketType?: string | null;
  outcomes?: Array<{ key: string; label: string }> | null;
  outcomeProbabilities?: Array<{ key: string; label: string; probabilityPct: number }> | null;
}

interface HomeRailsPayload {
  forYou: UnifiedHomeEvent[];
  trending: UnifiedHomeEvent[];
  top24h: UnifiedHomeEvent[];
  followed: UnifiedHomeEvent[];
  categories: Array<{
    id: MarketCategoryId;
    label: string;
    href: string;
    events: UnifiedHomeEvent[];
  }>;
}

function isMultiOutcomeTile(event: UnifiedHomeEvent): boolean {
  const hasMultiOptionType =
    !!event.marketType &&
    isMarketTypeId(event.marketType) &&
    MULTI_OPTION_MARKET_TYPES.includes(event.marketType);
  if (hasMultiOptionType) return true;
  const parsedOutcomes =
    parseOutcomesJson(event.outcomes) ??
    (deriveOutcomesFromTitle(event.title).length > 0
      ? deriveOutcomesFromTitle(event.title)
      : null);
  return !!parsedOutcomes && parsedOutcomes.length > 2;
}

type LayoutEvent = UnifiedHomeEvent & { isMultiOutcome: boolean; rank?: number };

const SPORTS_CATEGORY_SLUGS = [
  "sport",
  "calcio",
  "tennis",
  "pallacanestro",
  "pallavolo",
  "formula-1",
  "motogp",
];

function eventBelongsToCategory(eventCategory: string, categoryId: MarketCategoryId): boolean {
  if (categoryId === "trending") return true;
  const slug = categoryToSlug(eventCategory);
  if (categoryId === "elections") return slug === "elezioni" || slug === "elections";
  if (categoryId === "politics") return slug === "politica" || slug === "politics";
  if (categoryId === "sports") return SPORTS_CATEGORY_SLUGS.includes(slug);
  if (categoryId === "culture") return slug === "cultura" || slug === "culture";
  if (categoryId === "crypto") return slug === "cripto" || slug === "crypto";
  if (categoryId === "climate") return slug === "clima" || slug === "climate";
  if (categoryId === "economics") return slug === "economia" || slug === "economics";
  if (categoryId === "mentions") return slug === "menzioni" || slug === "mentions";
  if (categoryId === "companies") return slug === "aziende" || slug === "companies";
  if (categoryId === "finance") return slug === "finanza" || slug === "financials";
  if (categoryId === "tech-science") {
    return (
      slug === "tecnologia" ||
      slug === "scienza" ||
      slug === "tech-science" ||
      slug === "tecnologia-e-scienza"
    );
  }
  return false;
}

function softAlternateByShape(items: LayoutEvent[], lookahead = 4): LayoutEvent[] {
  const out = [...items];
  for (let i = 1; i < out.length; i += 1) {
    if (out[i].isMultiOutcome !== out[i - 1].isMultiOutcome) continue;
    const swapIndex = out.findIndex(
      (candidate, idx) =>
        idx > i &&
        idx <= i + lookahead &&
        candidate.isMultiOutcome !== out[i - 1].isMultiOutcome
    );
    if (swapIndex > i) {
      [out[i], out[swapIndex]] = [out[swapIndex], out[i]];
    }
  }
  return out;
}

function balanceRowsByShape(items: LayoutEvent[], lookahead = 8): LayoutEvent[] {
  const out = [...items];
  for (let rowStart = 0; rowStart < out.length - 1; rowStart += 2) {
    const first = out[rowStart];
    const second = out[rowStart + 1];
    if (!first || !second) break;
    if (first.isMultiOutcome !== second.isMultiOutcome) continue;

    let swapIndex = -1;
    for (
      let idx = rowStart + 2;
      idx < out.length && idx <= rowStart + 1 + lookahead;
      idx += 1
    ) {
      if (out[idx].isMultiOutcome !== first.isMultiOutcome) {
        swapIndex = idx;
        break;
      }
    }

    if (swapIndex >= 0) {
      [out[rowStart + 1], out[swapIndex]] = [out[swapIndex], out[rowStart + 1]];
    }
  }
  return out;
}

function formatCredits(value?: number): string {
  const safe = Number.isFinite(value) ? Math.max(0, Math.round(value ?? 0)) : 0;
  return safe.toLocaleString("it-IT");
}

interface TopFeaturedCardProps {
  event: UnifiedHomeEvent;
  generatedCover: string;
  onEventNavigate?: () => void;
}

function TopFeaturedCard({ event, generatedCover, onEventNavigate }: TopFeaturedCardProps) {
  const fallbackGradient = getCategoryFallbackGradient(event.category);
  const initialImage = event.aiImageUrl?.trim() || generatedCover;
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage);
  const [pressed, setPressed] = useState(false);

  return (
    <Link
      href={`/events/${event.id}`}
      onClick={onEventNavigate}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      className={`group relative block w-full overflow-hidden rounded-2xl border border-white/20 dark:border-white/10 aspect-[10/7] will-change-transform transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        pressed
          ? "scale-[1.02] -translate-y-[1px] shadow-[0_14px_42px_rgba(0,0,0,0.38)]"
          : "shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
      }`}
    >
      <div
        className={`absolute inset-0 bg-cover bg-center will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          pressed ? "scale-110" : "scale-100 group-hover:scale-105"
        }`}
        style={{ background: fallbackGradient }}
      />
      {imageSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            pressed ? "scale-110" : "scale-100 group-hover:scale-105"
          }`}
          onError={() => {
            if (imageSrc !== generatedCover) {
              setImageSrc(generatedCover);
              return;
            }
            setImageSrc(null);
          }}
        />
      )}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          pressed ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(120% 70% at 15% 0%, rgba(10,194,133,0.22) 0%, rgba(10,194,133,0) 55%), radial-gradient(90% 55% at 85% 100%, rgba(96,165,250,0.18) 0%, rgba(96,165,250,0) 60%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/58 to-black/35" />
      <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
        <h3
          className="font-kalshi font-bold text-white leading-[1.08] tracking-[0.01em] text-[1.5rem] sm:text-[1.85rem] md:text-[2.1rem] line-clamp-3"
          style={{ textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}
        >
          {event.title}
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-white/90 text-xs sm:text-sm font-medium">
          <span>{event.predictionsCount ?? 0} previsioni</span>
          <span className="h-1 w-1 rounded-full bg-white/65" aria-hidden />
          <span className="tabular-nums">₵ {formatCredits(event.totalCredits)}</span>
          <span className="h-1 w-1 rounded-full bg-white/65" aria-hidden />
          <span className="rounded-md border-[0.75px] border-white/75 px-1.5 py-[1px] leading-none text-white">
            {event.category}
          </span>
        </div>
      </div>
    </Link>
  );
}

function RankedRailTile({
  event,
  rank,
  onEventNavigate,
}: {
  event: LayoutEvent;
  rank: number;
  onEventNavigate?: () => void;
}) {
  const isDoubleDigit = rank >= 10;
  return (
    <div
      className={`relative flex w-[214px] min-w-[214px] snap-start items-stretch sm:w-[232px] sm:min-w-[232px] ${
        isDoubleDigit ? "pl-11 sm:pl-13" : "pl-8 sm:pl-9"
      }`}
    >
      <span
        className={`pointer-events-none absolute bottom-0 z-20 font-kalshi leading-[0.82] text-transparent ${
          isDoubleDigit
            ? "left-0 text-[5.4rem] sm:text-[6rem]"
            : "left-1 text-[6.3rem] sm:text-[7rem]"
        }`}
        style={{
          fontFamily: "var(--font-levels), 'Bebas Neue', 'Oswald', sans-serif",
          fontWeight: 400,
          letterSpacing: "0.01em",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          WebkitTextStroke: "1.4px rgba(255, 255, 255, 0.98)",
          filter: "none",
          textShadow: "none",
        }}
        aria-hidden
      >
        {rank}
      </span>
      <div className="relative z-30 w-full">
        <HomeEventTile
          id={event.id}
          title={event.title}
          category={event.category}
          closesAt={event.closesAt}
          yesPct={event.yesPct}
          predictionsCount={event.predictionsCount}
          variant="popular"
          onNavigate={onEventNavigate}
          compact={event.isMultiOutcome}
          imageUrl={event.aiImageUrl}
          marketType={event.marketType}
          outcomes={event.outcomes}
          outcomeProbabilities={event.outcomeProbabilities}
        />
      </div>
    </div>
  );
}

function HorizontalRail({
  title,
  href,
  events,
  onEventNavigate,
  ranked = false,
}: {
  title: string;
  href?: string;
  events: LayoutEvent[];
  onEventNavigate?: () => void;
  ranked?: boolean;
}) {
  if (events.length === 0) return null;
  return (
    <section aria-label={title} className="px-1 sm:px-1.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h3 className="font-kalshi text-[1.14rem] font-bold leading-[1.08] tracking-[0.005em] text-white/95 sm:text-[1.24rem]">
          {title}
        </h3>
        {href && (
          <Link
            href={href}
            className="text-[0.82rem] font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            Vedi tutti
          </Link>
        )}
      </div>
      <div className="netflix-rail-scroll scrollbar-hide flex snap-x snap-proximity gap-2.5 overflow-x-auto pb-1.5 sm:gap-3">
        {events.map((event, idx) =>
          ranked ? (
            <RankedRailTile
              key={event.id}
              event={event}
              rank={idx + 1}
              onEventNavigate={onEventNavigate}
            />
          ) : (
            <div
              key={event.id}
              className="w-[198px] min-w-[198px] snap-start sm:w-[214px] sm:min-w-[214px]"
            >
              <HomeEventTile
                id={event.id}
                title={event.title}
                category={event.category}
                closesAt={event.closesAt}
                yesPct={event.yesPct}
                predictionsCount={event.predictionsCount}
                variant="popular"
                onNavigate={onEventNavigate}
                compact={event.isMultiOutcome}
                imageUrl={event.aiImageUrl}
                marketType={event.marketType}
                outcomes={event.outcomes}
                outcomeProbabilities={event.outcomeProbabilities}
              />
            </div>
          )
        )}
      </div>
    </section>
  );
}

export function HomeUnifiedFeed({
  onEventNavigate,
  endpoint = "/api/feed/home-unified",
  featuredTitle = "Top 10 eventi delle ultime 24h",
  feedTitle = "Mercati per categoria",
  emptyTitle = "Nessun evento",
  emptyDescription = "Non ci sono ancora eventi in questa sezione.",
  layout = "netflix",
}: HomeUnifiedFeedProps) {
  const [events, setEvents] = useState<UnifiedHomeEvent[]>([]);
  const [featuredEventsApi, setFeaturedEventsApi] = useState<UnifiedHomeEvent[]>([]);
  const [heroEventApi, setHeroEventApi] = useState<UnifiedHomeEvent | null>(null);
  const [rowsApi, setRowsApi] = useState<HomeRailsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [heroPullDistance, setHeroPullDistance] = useState(0);
  const [heroScrollY, setHeroScrollY] = useState(0);
  const touchStartYRef = useRef<number | null>(null);
  const pullingHeroRef = useRef(false);

  const fetchFeed = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) throw new Error("Errore di caricamento");
      const data = await res.json();
      setEvents((data.events ?? []) as UnifiedHomeEvent[]);
      setFeaturedEventsApi((data.featuredEvents ?? []) as UnifiedHomeEvent[]);
      setHeroEventApi((data.heroEvent ?? null) as UnifiedHomeEvent | null);
      setRowsApi((data.rows ?? null) as HomeRailsPayload | null);
    } catch {
      if (!silent) {
        setEvents([]);
        setFeaturedEventsApi([]);
        setHeroEventApi(null);
        setRowsApi(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      fetchFeed(true);
    }, HOME_UNIFIED_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchFeed]);

  useEffect(() => {
    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        setHeroScrollY(Math.max(0, Math.min(window.scrollY, 360)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const arrangedEvents = useMemo(() => {
    const base = events.map((event) => ({
      ...event,
      isMultiOutcome: isMultiOutcomeTile(event),
    }));
    const alternated = softAlternateByShape(base);
    return balanceRowsByShape(alternated);
  }, [events]);

  const featuredEvents = useMemo(
    () => (featuredEventsApi.length > 0 ? featuredEventsApi : events.slice(0, 5)),
    [events, featuredEventsApi]
  );
  const heroEvent = useMemo(
    () => heroEventApi ?? featuredEvents[0] ?? null,
    [heroEventApi, featuredEvents]
  );
  const featuredIds = useMemo(
    () => new Set(featuredEvents.map((event) => event.id)),
    [featuredEvents]
  );
  const feedEvents = useMemo(
    () => arrangedEvents.filter((event) => !featuredIds.has(event.id)),
    [arrangedEvents, featuredIds]
  );
  const forYouEvents = useMemo(
    () =>
      (rowsApi?.forYou ?? feedEvents.slice(0, 16)).map((event) => ({
        ...event,
        isMultiOutcome: isMultiOutcomeTile(event),
      })),
    [rowsApi?.forYou, feedEvents]
  );
  const trendingEvents = useMemo(
    () =>
      (rowsApi?.trending ?? feedEvents).map((event) => ({
        ...event,
        isMultiOutcome: isMultiOutcomeTile(event),
      })),
    [rowsApi?.trending, feedEvents]
  );
  const top24hEvents = useMemo(
    () =>
      (rowsApi?.top24h ?? featuredEvents).map((event) => ({
        ...event,
        isMultiOutcome: isMultiOutcomeTile(event),
      })),
    [rowsApi?.top24h, featuredEvents]
  );
  const followedEvents = useMemo(
    () =>
      (rowsApi?.followed ?? []).map((event) => ({
        ...event,
        isMultiOutcome: isMultiOutcomeTile(event),
      })),
    [rowsApi?.followed]
  );
  const categoryRows = useMemo(
    () => {
      if (rowsApi?.categories?.length) {
        return rowsApi.categories.map((category) => ({
          ...category,
          events: category.events.map((event) => ({
            ...event,
            isMultiOutcome: isMultiOutcomeTile(event),
          })),
        }));
      }
      return MARKET_CATEGORIES
        .filter((category) => category.id !== "trending")
        .map((category) => ({
          ...category,
          events: feedEvents
            .filter((event) => eventBelongsToCategory(event.category, category.id))
            .map((event) => ({ ...event, isMultiOutcome: isMultiOutcomeTile(event) })),
        }))
        .filter((category) => category.events.length > 0);
    },
    [rowsApi?.categories, feedEvents]
  );

  useEffect(() => {
    if (layout !== "netflix" || typeof window === "undefined") return;

    const rails = Array.from(
      document.querySelectorAll<HTMLDivElement>(".netflix-rail-scroll")
    );
    const cleanups: Array<() => void> = [];

    for (const rail of rails) {
      let snapTimer = 0;
      let raf = 0;
      let pointerActive = false;
      let programmaticScroll = false;
      let lastScrollLeft = rail.scrollLeft;

      const stopAnimation = () => {
        if (raf) window.cancelAnimationFrame(raf);
        raf = 0;
      };

      const getNearestSnapLeft = () => {
        const cards = Array.from(rail.children) as HTMLElement[];
        if (cards.length === 0) return rail.scrollLeft;
        const scrollPaddingLeft = parseFloat(getComputedStyle(rail).scrollPaddingLeft || "0");
        const current = rail.scrollLeft;
        let nearest = current;
        let minDistance = Number.POSITIVE_INFINITY;
        for (const card of cards) {
          const snapLeft = Math.max(0, card.offsetLeft - scrollPaddingLeft);
          const distance = Math.abs(snapLeft - current);
          if (distance < minDistance) {
            minDistance = distance;
            nearest = snapLeft;
          }
        }
        return nearest;
      };

      const animateTo = (target: number) => {
        stopAnimation();
        const start = rail.scrollLeft;
        const delta = target - start;
        if (Math.abs(delta) < 1) return;
        const distance = Math.abs(delta);
        const duration = Math.min(760, Math.max(420, distance * 1.55));
        const startTs = performance.now();
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        programmaticScroll = true;

        const step = (now: number) => {
          const progress = Math.min(1, (now - startTs) / duration);
          rail.scrollLeft = start + delta * easeOutCubic(progress);
          lastScrollLeft = rail.scrollLeft;
          if (progress < 1) {
            raf = window.requestAnimationFrame(step);
          } else {
            raf = 0;
            programmaticScroll = false;
          }
        };
        raf = window.requestAnimationFrame(step);
      };

      const scheduleSnap = () => {
        if (pointerActive) return;
        if (snapTimer) window.clearTimeout(snapTimer);
        snapTimer = window.setTimeout(() => {
          animateTo(getNearestSnapLeft());
        }, 160);
      };

      const onScroll = () => {
        if (pointerActive || programmaticScroll) return;
        const moved = Math.abs(rail.scrollLeft - lastScrollLeft);
        lastScrollLeft = rail.scrollLeft;
        if (moved < 0.6) return;
        scheduleSnap();
      };
      const onPointerDown = () => {
        pointerActive = true;
        if (snapTimer) window.clearTimeout(snapTimer);
        stopAnimation();
        programmaticScroll = false;
      };
      const onPointerUp = () => {
        pointerActive = false;
        window.setTimeout(scheduleSnap, 24);
      };
      const onPointerLeave = () => {
        if (!pointerActive) return;
        pointerActive = false;
        window.setTimeout(scheduleSnap, 24);
      };

      rail.addEventListener("scroll", onScroll, { passive: true });
      rail.addEventListener("pointerdown", onPointerDown, { passive: true });
      rail.addEventListener("pointerup", onPointerUp, { passive: true });
      rail.addEventListener("pointercancel", onPointerUp, { passive: true });
      rail.addEventListener("pointerleave", onPointerLeave, { passive: true });
      rail.addEventListener("touchend", onPointerUp, { passive: true });
      rail.addEventListener("touchcancel", onPointerUp, { passive: true });
      rail.addEventListener("wheel", onScroll, { passive: true });

      if ("onscrollend" in rail) {
        rail.addEventListener("scrollend", onPointerUp as EventListener, { passive: true });
      }

      cleanups.push(() => {
        rail.removeEventListener("scroll", onScroll);
        rail.removeEventListener("pointerdown", onPointerDown);
        rail.removeEventListener("pointerup", onPointerUp);
        rail.removeEventListener("pointercancel", onPointerUp);
        rail.removeEventListener("pointerleave", onPointerLeave);
        rail.removeEventListener("touchend", onPointerUp);
        rail.removeEventListener("touchcancel", onPointerUp);
        rail.removeEventListener("wheel", onScroll);
        rail.removeEventListener("scrollend", onPointerUp as EventListener);
        if (snapTimer) window.clearTimeout(snapTimer);
        stopAnimation();
      });
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [layout, forYouEvents.length, trendingEvents.length, top24hEvents.length, followedEvents.length, categoryRows.length]);
  const heroImageTransform = useMemo(() => {
    const pull = Math.max(0, heroPullDistance);
    const scroll = Math.max(0, heroScrollY);
    const scale = 1 + pull / 900;
    const translateY = pull * 0.3 - scroll * 0.16;
    return `translate3d(0, ${translateY}px, 0) scale(${scale})`;
  }, [heroPullDistance, heroScrollY]);

  const heroOverlayOpacity = useMemo(() => {
    const pull = Math.max(0, heroPullDistance);
    return Math.max(0.72, 0.9 - pull / 500);
  }, [heroPullDistance]);

  const handleHeroTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
    if (typeof window === "undefined") return;
    if (window.scrollY > 0) {
      touchStartYRef.current = null;
      pullingHeroRef.current = false;
      return;
    }
    touchStartYRef.current = e.touches[0]?.clientY ?? null;
    pullingHeroRef.current = true;
  }, []);

  const handleHeroTouchMove = useCallback((e: TouchEvent<HTMLElement>) => {
    if (!pullingHeroRef.current || touchStartYRef.current == null) return;
    if (typeof window !== "undefined" && window.scrollY > 0) return;
    const currentY = e.touches[0]?.clientY ?? touchStartYRef.current;
    const delta = Math.max(0, currentY - touchStartYRef.current);
    // Elastic curve: grows fast at first, then dampens.
    const eased = Math.min(160, Math.sqrt(delta) * 10);
    setHeroPullDistance(eased);
  }, []);

  const releaseHeroPull = useCallback(() => {
    pullingHeroRef.current = false;
    touchStartYRef.current = null;
    setHeroPullDistance(0);
  }, []);

  if (loading) {
    return <LoadingBlock message="Caricamento eventi…" />;
  }

  if (events.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  if (layout === "classic") {
    return (
      <section aria-label="Feed personalizzato">
        <div className="mb-5 sm:mb-6">
          <h2 className="mb-4 text-left font-kalshi text-[1.55rem] font-bold leading-[0.98] tracking-[0.01em] text-white/95 sm:mb-5 sm:text-[1.9rem] md:text-[2.15rem]">
            {featuredTitle}
          </h2>
          <div className="flex flex-col gap-3 sm:gap-4">
            {featuredEvents.map((event, idx) => {
              const generatedCover = `/top24h-cover-${(idx % 5) + 1}.svg`;
              return (
                <TopFeaturedCard
                  key={event.id}
                  event={event}
                  generatedCover={generatedCover}
                  onEventNavigate={onEventNavigate}
                />
              );
            })}
          </div>
        </div>
        <div className="pt-2 sm:pt-3 border-t border-white/10">
          <h2 className="font-kalshi font-bold text-fg leading-[1.1] tracking-[0.01em] text-[1.5rem] sm:text-[1.85rem] md:text-[2.1rem] mb-3 sm:mb-4">
            {feedTitle}
          </h2>
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {feedEvents.map((event) => (
              <HomeEventTile
                key={event.id}
                id={event.id}
                title={event.title}
                category={event.category}
                closesAt={event.closesAt}
                yesPct={event.yesPct}
                predictionsCount={event.predictionsCount}
                variant="popular"
                onNavigate={onEventNavigate}
                compact={event.isMultiOutcome}
                imageUrl={event.aiImageUrl}
                marketType={event.marketType}
                outcomes={event.outcomes}
                outcomeProbabilities={event.outcomeProbabilities}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Homepage feed Netflix">
      {heroEvent && (
        <section
          className="relative left-1/2 right-1/2 -mx-[50vw] mb-7 h-[72vh] max-h-[760px] min-h-[520px] w-screen overflow-hidden border-b border-white/10 touch-pan-y"
          aria-label="Evento principale"
          onTouchStart={handleHeroTouchStart}
          onTouchMove={handleHeroTouchMove}
          onTouchEnd={releaseHeroPull}
          onTouchCancel={releaseHeroPull}
        >
          <div
            className="absolute inset-0 bg-cover bg-center will-change-transform transition-transform duration-200 ease-out"
            style={{
              background: getCategoryFallbackGradient(heroEvent.category),
              transform: heroImageTransform,
              transformOrigin: "center top",
            }}
          />
          {heroEvent.aiImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroEvent.aiImageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover will-change-transform transition-transform duration-200 ease-out"
              style={{ transform: heroImageTransform, transformOrigin: "center top" }}
            />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20 transition-opacity duration-200 ease-out"
            style={{ opacity: heroOverlayOpacity }}
          />
          <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl items-end px-4 pb-8 sm:px-6 sm:pb-10">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                Evento principale
              </p>
              <h2
                className="font-kalshi text-[2rem] font-bold leading-[0.98] tracking-[0.01em] text-white sm:text-[2.5rem] md:text-[2.9rem]"
                style={{ textShadow: "0 8px 30px rgba(0,0,0,0.65)" }}
              >
                {heroEvent.title}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-white/90 sm:text-sm">
                <span>{heroEvent.predictionsCount ?? 0} previsioni</span>
                <span className="h-1 w-1 rounded-full bg-white/70" aria-hidden />
                <span>₵ {formatCredits(heroEvent.totalCredits)}</span>
                <span className="h-1 w-1 rounded-full bg-white/70" aria-hidden />
                <span className="rounded-md border border-white/60 px-2 py-0.5">{heroEvent.category}</span>
              </div>
              <div className="mt-5 flex items-center gap-2.5">
                <Link
                  href={`/events/${heroEvent.id}`}
                  onClick={onEventNavigate}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  Apri mercato
                </Link>
                <Link
                  href="/discover/tutti?sort=popular"
                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-white/35 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/40"
                >
                  Sfoglia mercati
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="space-y-8">
        <HorizontalRail title="Scelti per te" events={forYouEvents} onEventNavigate={onEventNavigate} />
        <HorizontalRail
          title="Mercati in tendenza"
          href="/discover/tutti?sort=popular"
          events={trendingEvents}
          onEventNavigate={onEventNavigate}
        />
        <HorizontalRail
          title="Top 10 mercati delle ultime 24h"
          events={top24hEvents}
          onEventNavigate={onEventNavigate}
          ranked
        />
        <HorizontalRail
          title="Mercati seguiti"
          href="/discover/seguiti"
          events={followedEvents}
          onEventNavigate={onEventNavigate}
        />
        {categoryRows.map((category) => (
          <HorizontalRail
            key={category.id}
            title={category.label}
            href={category.href}
            events={category.events}
            onEventNavigate={onEventNavigate}
          />
        ))}
        {categoryRows.length === 0 && (
          <p className="py-4 text-ds-body-sm text-fg-muted">Nessun evento al momento.</p>
        )}
      </div>
    </section>
  );
}
