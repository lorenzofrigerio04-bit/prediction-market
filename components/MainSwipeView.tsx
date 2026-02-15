"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  getMainTabIndex,
  getMainTabPath,
  MAIN_TAB_PATHS,
} from "@/lib/main-tabs";

const SWIPE_THRESHOLD_PX = 60;
const SLIDE_DURATION_MS = 280;

export default function MainSwipeView({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentIndex = getMainTabIndex(pathname);
  const prevIndexRef = useRef(currentIndex);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isEntered, setIsEntered] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Animazione ingresso: direzione e slide da bordo verso centro
  useEffect(() => {
    const prev = prevIndexRef.current;
    setSlideDirection(prev !== currentIndex ? (currentIndex > prev ? 1 : -1) : 0);
    prevIndexRef.current = currentIndex;
    setIsEntered(false);
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsEntered(true));
    });
    return () => cancelAnimationFrame(t);
  }, [pathname, currentIndex]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - touchStartX.current;
      const deltaY = endY - touchStartY.current;

      // Swipe orizzontale prevalente (evita conflitto con scroll verticale)
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaY) > Math.abs(deltaX)) return;

      if (deltaX < -SWIPE_THRESHOLD_PX && currentIndex < MAIN_TAB_PATHS.length - 1) {
        const next = getMainTabPath(currentIndex + 1);
        if (next) router.replace(next);
      } else if (deltaX > SWIPE_THRESHOLD_PX && currentIndex > 0) {
        const prev = getMainTabPath(currentIndex - 1);
        if (prev) router.replace(prev);
      }
    },
    [currentIndex, router]
  );

  const initialX = slideDirection * 100;
  const enteredX = 0;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 min-h-0 overflow-hidden touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: "pan-y" }}
    >
      <div
        key={pathname}
        className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden"
        style={{
          transform: `translate3d(${isEntered ? enteredX : initialX}%, 0, 0)`,
          transition: `transform ${SLIDE_DURATION_MS}ms var(--ease-out, cubic-bezier(0.33, 1, 0.68, 1))`,
          willChange: "transform",
        }}
      >
        {/* Spazio per bottom nav mobile */}
        <div className="min-h-full pb-20 md:pb-0">{children}</div>
      </div>
    </div>
  );
}
