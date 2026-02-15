"use client";

import { memo } from "react";

interface MarketCardSkeletonProps {
  index?: number;
}

function MarketCardSkeleton({ index = 0 }: MarketCardSkeletonProps) {
  return (
    <div
      className="rounded-2xl md:rounded-3xl box-neon-soft p-4 md:p-5 h-full flex flex-col animate-feed-in opacity-0"
      style={{ animationDelay: `${Math.min(index * 60, 360)}ms` }}
      aria-hidden
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="h-7 w-24 rounded-xl bg-fg-muted/15 dark:bg-white/10" />
        <div className="h-7 w-12 rounded-xl bg-fg-muted/15 dark:bg-white/10" />
      </div>
      <div className="space-y-2 mb-4 flex-grow">
        <div className="h-5 w-full rounded bg-fg-muted/15 dark:bg-white/10" />
        <div className="h-5 w-4/5 rounded bg-fg-muted/10 dark:bg-white/5" />
      </div>
      <div className="mb-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-12 rounded bg-fg-muted/15 dark:bg-white/10" />
          <div className="h-4 w-12 rounded bg-fg-muted/15 dark:bg-white/10" />
        </div>
        <div className="h-2.5 w-full rounded-full bg-fg-muted/15 dark:bg-white/10" />
        <div className="h-3 w-24 rounded bg-fg-muted/10 dark:bg-white/5" />
      </div>
      <div className="h-12 w-full rounded-xl bg-fg-muted/15 dark:bg-white/10 mt-auto" />
    </div>
  );
}

export default memo(MarketCardSkeleton);
