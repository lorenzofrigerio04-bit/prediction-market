"use client";

import { useEffect, useState } from "react";

export type OddsData = {
  matched: true;
  odds: {
    bookmakers: { key: string; title: string; yesPrice: number; noPrice: number }[];
    bestYes: number;
    bestNo: number;
    sportTitle?: string;
  };
};

type OddsResponse =
  | { matched: false }
  | OddsData;

interface OddsBadgeProps {
  eventId: string;
  className?: string;
}

/**
 * Badge che mostra "Su X bookmaker · Migliore quota SÌ: Y" quando l'evento è matchabile con The Odds API.
 */
export function OddsBadge({ eventId, className = "" }: OddsBadgeProps) {
  const [data, setData] = useState<OddsResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/events/${eventId}/odds`)
      .then((res) => res.json())
      .then((json: OddsResponse) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData({ matched: false });
      });
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (!data?.matched || !data.odds) return null;

  const { bookmakers, bestYes } = data.odds;
  const count = bookmakers.length;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-ds-caption font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 ${className}`}
      title={`Confronta le quote su ${count} bookmaker`}
    >
      <svg
        className="w-3.5 h-3.5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
      <span>
        Su {count} bookmaker · Migliore quota SÌ: {bestYes.toFixed(2)}
      </span>
    </span>
  );
}
