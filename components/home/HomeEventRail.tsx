"use client";

import type { ReactNode } from "react";
import { newsRailEdgeMaskStyle } from "@/lib/news-rail-mask";

interface HomeEventRailProps {
  children: ReactNode;
  className?: string;
}

/**
 * Scroll orizzontale con maschera di dissolvenza ai bordi (stesso pattern dei rail news).
 */
export function HomeEventRail({ children, className = "" }: HomeEventRailProps) {
  return (
    <div className={`-mx-2 sm:-mx-4 ${className}`}>
      <div
        className="overflow-x-auto scrollbar-hide px-2 pb-1 sm:px-4"
        style={newsRailEdgeMaskStyle}
      >
        <div className="flex w-max gap-2.5 pb-2 sm:gap-3">{children}</div>
      </div>
    </div>
  );
}
