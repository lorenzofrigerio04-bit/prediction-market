"use client";

import { useState, useEffect, useRef } from "react";

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
      className="landing-hero-stats flex flex-wrap justify-center items-center gap-4 md:gap-6 mt-8 pt-8"
      role="status"
      aria-live="polite"
      aria-label={`${stats.usersCount} utenti, ${stats.activeEventsCount} eventi attivi`}
    >
      <div className="landing-hero-stats__pill flex items-center gap-2.5 px-5 py-2.5">
        <span className="landing-hero-stats__dot" aria-hidden />
        <span className="text-ds-body font-medium text-white">
          <span className="font-numeric font-bold text-lg md:text-xl tabular-nums text-white">{usersDisplay}</span>
          <span className="ml-1.5 opacity-90">utenti</span>
        </span>
      </div>
      <div className="landing-hero-stats__pill flex items-center gap-2.5 px-5 py-2.5">
        <span className="landing-hero-stats__dot landing-hero-stats__dot--alt" aria-hidden />
        <span className="text-ds-body font-medium text-white">
          <span className="font-numeric font-bold text-lg md:text-xl tabular-nums text-white">{eventsDisplay}</span>
          <span className="ml-1.5 opacity-90">eventi attivi</span>
        </span>
      </div>
      <span className="text-ds-caption font-semibold uppercase tracking-wider text-white/70 flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
        In diretta
      </span>
    </div>
  );
}
