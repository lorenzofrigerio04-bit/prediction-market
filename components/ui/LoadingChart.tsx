"use client";

import { useId } from "react";

/**
 * Grafico di caricamento: asse X si allarga lentamente, asse Y si allunga
 * molto veloce, linea "prezzo" che si traccia su e giù veloce (stile memecoin scam).
 */

const VIEW_SIZE = 56;
const PADDING = 6;
const CHART_LEFT = PADDING;
const CHART_BOTTOM = VIEW_SIZE - PADDING;
const CHART_WIDTH = VIEW_SIZE - PADDING * 2;
const CHART_HEIGHT = VIEW_SIZE - PADDING * 2.5;

// Asse X: da (CHART_LEFT, CHART_BOTTOM) a (CHART_LEFT + CHART_WIDTH, CHART_BOTTOM)
const X_LEN = CHART_WIDTH;
// Asse Y: da (CHART_LEFT, CHART_BOTTOM) verso l'alto
const Y_LEN = CHART_HEIGHT;

// Path volatile: punti che salgono e scendono (stile pump & dump)
// Coordinate relative all'area grafico: x da 0 a CHART_WIDTH, y da 0 (top) a CHART_HEIGHT (bottom)
// In SVG y cresce verso il basso, quindi "prezzo alto" = y piccolo
const VOLATILE_POINTS = [
  [CHART_LEFT + 2, CHART_BOTTOM - 8],
  [CHART_LEFT + 8, CHART_BOTTOM - 28],
  [CHART_LEFT + 14, CHART_BOTTOM - 12],
  [CHART_LEFT + 20, CHART_BOTTOM - 32],
  [CHART_LEFT + 26, CHART_BOTTOM - 18],
  [CHART_LEFT + 32, CHART_BOTTOM - 36],
  [CHART_LEFT + 38, CHART_BOTTOM - 14],
  [CHART_LEFT + 44, CHART_BOTTOM - 30],
  [CHART_LEFT + CHART_WIDTH - 2, CHART_BOTTOM - 20],
];
const LINE_D = VOLATILE_POINTS.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");

export default function LoadingChart() {
  const gradientId = useId();
  return (
    <svg
      className="loading-chart"
      viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
      width={VIEW_SIZE}
      height={VIEW_SIZE}
      style={{ display: "block", flexShrink: 0 }}
      aria-hidden
      role="img"
      aria-label="Caricamento"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgb(var(--primary, 59 130 246))" stopOpacity="0.4" />
          <stop offset="50%" stopColor="rgb(var(--primary, 59 130 246))" stopOpacity="1" />
          <stop offset="100%" stopColor="rgb(var(--primary, 59 130 246))" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {/* Asse X: si allarga lentamente */}
      <line
        x1={CHART_LEFT}
        y1={CHART_BOTTOM}
        x2={CHART_LEFT + CHART_WIDTH}
        y2={CHART_BOTTOM}
        className="loading-chart__axis-x"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Asse Y: si allunga molto veloce */}
      <line
        x1={CHART_LEFT}
        y1={CHART_BOTTOM}
        x2={CHART_LEFT}
        y2={CHART_BOTTOM - CHART_HEIGHT}
        className="loading-chart__axis-y"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Linea "prezzo" che si traccia su e giù veloce (pathLength per animazione dash) */}
      <path
        d={LINE_D}
        pathLength="100"
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="loading-chart__line"
      />
    </svg>
  );
}
