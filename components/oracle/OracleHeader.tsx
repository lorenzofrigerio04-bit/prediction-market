"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface OracleHeaderProps {
  onMenuClick: () => void;
  onNewChat: () => void;
}

const SCROLL_HIDE_THRESHOLD = 60;

/** Icona "inizia nuova chat" - documento con matita (compose) */
function IconNewChat({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
    </svg>
  );
}

export default function OracleHeader({ onMenuClick, onNewChat }: OracleHeaderProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY ?? 0;
      if (scrollY < 16) {
        setVisible(true);
      } else if (scrollY > lastScrollYRef.current && scrollY > SCROLL_HIDE_THRESHOLD) {
        setVisible(false);
      } else if (scrollY < lastScrollYRef.current) {
        setVisible(true);
      }
      lastScrollYRef.current = scrollY;
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <div
      className={`fixed left-0 right-0 z-30 flex items-center justify-between px-3 py-2.5 border-b border-white/10 bg-[#171717]/95 backdrop-blur-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ top: "var(--safe-area-inset-top)" }}
    >
      <button
        type="button"
        onClick={onMenuClick}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors touch-manipulation"
        aria-label="Apri storico chat"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[17px] font-semibold text-white">
        Oracle Assistant
      </h1>
      <button
        type="button"
        onClick={onNewChat}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-transparent border-none text-gray-400 hover:text-white transition-colors touch-manipulation"
        aria-label="Inizia nuova chat"
      >
        <IconNewChat className="w-5 h-5" />
      </button>
    </div>
  );
}
