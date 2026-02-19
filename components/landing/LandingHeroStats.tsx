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
      className="landing-hero-stats flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-6 pt-6 border-t border-[rgb(var(--border)/var(--border-o))]"
      role="status"
      aria-live="polite"
      aria-label={`${stats.usersCount} utenti, ${stats.activeEventsCount} eventi attivi`}
    >
      <div className="flex items-center gap-2">
        <span className="landing-hero-stats__dot" aria-hidden />
        <span className="text-ds-body-sm text-fg-muted">
          <span className="font-numeric font-semibold text-fg tabular-nums">{usersDisplay}</span>
          <span className="ml-1">utenti</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="landing-hero-stats__dot landing-hero-stats__dot--alt" aria-hidden />
        <span className="text-ds-body-sm text-fg-muted">
          <span className="font-numeric font-semibold text-fg tabular-nums">{eventsDisplay}</span>
          <span className="ml-1">eventi attivi</span>
        </span>
      </div>
    </div>
  );
}
