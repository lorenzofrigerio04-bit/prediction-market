"use client";

import { useState, useEffect, useRef } from "react";
import { IconUser, IconCalendar } from "@/components/ui/Icons";

const DURATION_MS = 1600;
const REFRESH_INTERVAL_MS = 60000;

interface LandingStats {
  usersCount: number;
  activeEventsCount: number;
}

function useCountUp(end: number, enabled: boolean, durationMs: number) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || end === 0) {
      setValue(end);
      return;
    }
    setValue(0);
    startRef.current = null;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / durationMs, 1);
      const easeOutQuart = 1 - (1 - t) ** 4;
      const current = Math.round(easeOutQuart * end);
      setValue(current);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, enabled, durationMs]);

  return value;
}

export default function LandingHeroStats() {
  const [stats, setStats] = useState<LandingStats | null>(null);
  const usersDisplay = useCountUp(stats?.usersCount ?? 0, stats !== null, DURATION_MS);
  const eventsDisplay = useCountUp(stats?.activeEventsCount ?? 0, stats !== null, DURATION_MS);

  useEffect(() => {
    let cancelled = false;
    const fetchStats = () => {
      fetch("/api/landing-stats")
        .then((res) => res.json())
        .then((data: LandingStats) => {
          if (!cancelled) setStats(data);
        })
        .catch(() => {
          if (!cancelled) setStats({ usersCount: 0, activeEventsCount: 0 });
        });
    };
    fetchStats();
    const interval = setInterval(fetchStats, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (stats === null) return null;

  return (
    <div
      className="landing-hero-stats flex flex-nowrap justify-center items-stretch gap-3 sm:gap-4"
      role="status"
      aria-live="polite"
      aria-label={`${stats.usersCount} utenti, ${stats.activeEventsCount} eventi attivi`}
    >
      <div className="landing-hero-stats__card flex items-center gap-3 flex-1 min-w-0 max-w-[10rem] sm:max-w-[9rem]">
        <IconUser className="landing-hero-stats__icon w-7 h-7 shrink-0" aria-hidden />
        <div className="flex flex-col min-w-0">
          <span className="landing-hero-stats__number text-2xl sm:text-3xl tabular-nums leading-tight">
            {usersDisplay}
          </span>
          <span className="landing-hero-stats__label mt-0.5">utenti</span>
        </div>
      </div>
      <div className="landing-hero-stats__card landing-hero-stats__card--events flex items-center gap-3 flex-1 min-w-0 max-w-[10rem] sm:max-w-[9rem]">
        <div className="relative shrink-0">
          <IconCalendar className="landing-hero-stats__icon landing-hero-stats__icon--events w-7 h-7" aria-hidden />
          <span className="landing-hero-stats__live-dot absolute -bottom-1 -right-0.5" aria-hidden />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="landing-hero-stats__number text-2xl sm:text-3xl tabular-nums leading-tight">
            {eventsDisplay}
          </span>
          <span className="landing-hero-stats__label mt-0.5">eventi attivi</span>
        </div>
      </div>
    </div>
  );
}
