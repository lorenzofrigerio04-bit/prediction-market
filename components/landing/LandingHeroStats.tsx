"use client";

import { useState, useEffect, useRef } from "react";
import { IconUser, IconCalendar } from "@/components/ui/Icons";

const COUNT_UP_DURATION_MS = 3000;
const REFRESH_INTERVAL_MS = 60000;
const DELAY_BEFORE_VARIATION_MS = 4500;
const VARIATION_DURATION_MS = 1400;
const VARIATION_PERCENT = 0.08;
const VARIATION_INTERVAL_MIN_MS = 10000;
const VARIATION_INTERVAL_MAX_MS = 18000;

interface LandingStats {
  usersCount: number;
  activeEventsCount: number;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
      const ease = 1 - (1 - t) ** 4;
      const current = Math.round(ease * end);
      setValue(current);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [end, enabled, durationMs]);

  return value;
}

function useAnimatedValue(
  target: number,
  durationMs: number,
  enabled: boolean
): number {
  const [value, setValue] = useState(target);
  const prevTargetRef = useRef(target);
  const startRef = useRef<number>(0);
  const fromRef = useRef(target);
  const currentRef = useRef(target);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      prevTargetRef.current = target;
      currentRef.current = target;
      return;
    }
    if (target === prevTargetRef.current) return;
    fromRef.current = currentRef.current;
    if (fromRef.current === 0 && target > 0) {
      currentRef.current = target;
      fromRef.current = target;
      prevTargetRef.current = target;
      setValue(target);
      return;
    }
    startRef.current = performance.now();
    prevTargetRef.current = target;

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / durationMs, 1);
      const eased = easeInOutCubic(t);
      const current = Math.round(fromRef.current + (target - fromRef.current) * eased);
      currentRef.current = current;
      setValue(current);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, enabled, durationMs]);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      currentRef.current = target;
    }
  }, [enabled, target]);

  return value;
}

export default function LandingHeroStats() {
  const [stats, setStats] = useState<LandingStats | null>(null);
  const usersCountUp = useCountUp(stats?.usersCount ?? 0, stats !== null, COUNT_UP_DURATION_MS);
  const eventsDisplay = useCountUp(stats?.activeEventsCount ?? 0, stats !== null, COUNT_UP_DURATION_MS);

  const baseUsers = stats?.usersCount ?? 0;
  const [variationActive, setVariationActive] = useState(false);
  const [liveUsersTarget, setLiveUsersTarget] = useState(baseUsers);
  const liveUsersDisplay = useAnimatedValue(
    liveUsersTarget,
    VARIATION_DURATION_MS,
    variationActive && baseUsers > 0
  );
  const variationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const variationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    if (stats === null || baseUsers === 0) return;
    if (usersCountUp !== baseUsers) return;

    variationTimeoutRef.current = setTimeout(() => {
      setVariationActive(true);
      setLiveUsersTarget(baseUsers);
    }, DELAY_BEFORE_VARIATION_MS);

    return () => {
      if (variationTimeoutRef.current) clearTimeout(variationTimeoutRef.current);
    };
  }, [stats, baseUsers, usersCountUp]);

  useEffect(() => {
    if (!variationActive || baseUsers === 0) return;

    const scheduleNext = () => {
      const delay =
        VARIATION_INTERVAL_MIN_MS +
        Math.random() * (VARIATION_INTERVAL_MAX_MS - VARIATION_INTERVAL_MIN_MS);
      variationIntervalRef.current = setTimeout(() => {
        const delta = (Math.random() * 2 - 1) * VARIATION_PERCENT;
        const newTarget = Math.round(baseUsers * (1 + delta));
        setLiveUsersTarget(Math.max(1, newTarget));
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => {
      if (variationIntervalRef.current) clearTimeout(variationIntervalRef.current);
    };
  }, [variationActive, baseUsers]);

  if (stats === null) return null;

  const usersDisplay = variationActive ? liveUsersDisplay : usersCountUp;

  return (
    <div
      className="landing-hero-stats flex flex-nowrap justify-center items-stretch gap-3 sm:gap-4"
      role="status"
      aria-live="polite"
      aria-label={`${usersDisplay} predictor attivi, ${stats.activeEventsCount} eventi attivi`}
    >
      <div className="landing-hero-stats__card flex items-center gap-3 flex-1 min-w-0 max-w-[10rem] sm:max-w-[9rem]">
        <IconUser className="landing-hero-stats__icon w-7 h-7 shrink-0" aria-hidden />
        <div className="flex flex-col min-w-0">
          <span className="landing-hero-stats__number text-2xl sm:text-3xl tabular-nums leading-tight">
            {usersDisplay}
          </span>
          <span className="landing-hero-stats__label mt-0.5">PREDICTOR ATTIVI</span>
        </div>
      </div>
      <div className="landing-hero-stats__card landing-hero-stats__card--events flex items-center gap-3 flex-1 min-w-0 max-w-[10rem] sm:max-w-[9rem]">
        <IconCalendar className="landing-hero-stats__icon landing-hero-stats__icon--events w-7 h-7 shrink-0" aria-hidden />
        <div className="flex flex-col min-w-0">
          <span className="landing-hero-stats__number text-2xl sm:text-3xl tabular-nums leading-tight">
            {eventsDisplay}
          </span>
          <span className="landing-hero-stats__label mt-0.5">EVENTI ATTIVI</span>
        </div>
      </div>
    </div>
  );
}
