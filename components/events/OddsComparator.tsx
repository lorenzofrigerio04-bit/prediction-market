"use client";

import { useEffect, useState } from "react";

export type OddsComparatorData = {
  matched: true;
  odds: {
    homeTeam: string;
    awayTeam: string;
    yesTeam: string;
    noTeam: string;
    sportTitle?: string;
    commenceTime?: string;
    bookmakers: { key: string; title: string; yesPrice: number; noPrice: number }[];
    bestYes: number;
    bestNo: number;
  };
};

type OddsResponse =
  | { matched: false }
  | OddsComparatorData;

interface OddsComparatorProps {
  eventId: string;
  className?: string;
}

/**
 * Comparatore di quote bookmaker per la pagina dettaglio evento.
 * Mostra tabella Bookmaker | Quota SÌ | Quota NO con evidenziazione delle migliori.
 */
export function OddsComparator({ eventId, className = "" }: OddsComparatorProps) {
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

  const { homeTeam, awayTeam, yesTeam, noTeam, sportTitle, bookmakers, bestYes, bestNo } = data.odds;

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-ds-h4 font-bold text-fg">
          Quote bookmaker
        </h4>
        {sportTitle && (
          <span className="text-ds-caption text-fg-muted">{sportTitle}</span>
        )}
      </div>
      <p className="text-ds-body-sm text-fg-muted mb-4">
        {homeTeam} vs {awayTeam} — confronto quote su {bookmakers.length} piattaforme
      </p>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-left text-ds-body-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-2 px-2 font-semibold text-fg-muted">Bookmaker</th>
              <th className="py-2 px-2 font-semibold text-fg-muted text-right">
                Quota SÌ
              </th>
              <th className="py-2 px-2 font-semibold text-fg-muted text-right">
                Quota NO
              </th>
            </tr>
          </thead>
          <tbody>
            {bookmakers.map((bm) => (
              <tr
                key={bm.key}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="py-2.5 px-2 font-medium text-fg">{bm.title}</td>
                <td
                  className={`py-2.5 px-2 text-right font-numeric tabular-nums ${
                    bm.yesPrice >= bestYes ? "text-success font-bold" : "text-fg"
                  }`}
                >
                  {bm.yesPrice.toFixed(2)}
                  {bm.yesPrice >= bestYes && (
                    <span className="ml-1 text-ds-micro text-success">★</span>
                  )}
                </td>
                <td
                  className={`py-2.5 px-2 text-right font-numeric tabular-nums ${
                    bm.noPrice >= bestNo ? "text-danger font-bold" : "text-fg"
                  }`}
                >
                  {bm.noPrice.toFixed(2)}
                  {bm.noPrice >= bestNo && (
                    <span className="ml-1 text-ds-micro text-danger">★</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-ds-caption text-fg-muted mt-3">
        SÌ = vittoria {yesTeam}; NO = pareggio o vittoria {noTeam}. ★ = migliore quota.
      </p>
    </div>
  );
}
