"use client";

/** Accent della sezione homepage / rail (allineato a `HomeEventCard` `accent`). */
export type ProbabilityRailAccent =
  | "primary"
  | "gold"
  | "rose"
  | "violet"
  | "emerald"
  | "cyan";

export type Top5Rank = 1 | 2 | 3 | 4 | 5;

const RAIL_FALLBACK_CHROME: Record<ProbabilityRailAccent, { border: string; glow: string }> = {
  primary: { border: "rgba(80, 245, 252, 0.5)", glow: "rgba(80, 245, 252, 0.16)" },
  gold: { border: "rgba(252, 211, 77, 0.48)", glow: "rgba(252, 211, 77, 0.14)" },
  rose: { border: "rgba(251, 113, 133, 0.5)", glow: "rgba(251, 113, 133, 0.14)" },
  violet: { border: "rgba(167, 139, 250, 0.5)", glow: "rgba(167, 139, 250, 0.14)" },
  emerald: { border: "rgba(52, 211, 153, 0.5)", glow: "rgba(52, 211, 153, 0.14)" },
  cyan: { border: "rgba(34, 211, 238, 0.5)", glow: "rgba(34, 211, 238, 0.14)" },
};

/** Allineato ai colori posizione `RANK_CONFIGS` in Top24h (tutte le posizioni ultra premium). */
const TOP5_RANK_CHROME: Record<Top5Rank, { border: string; glow: string }> = {
  1: { border: "rgba(110, 231, 213, 0.62)", glow: "rgba(10, 186, 181, 0.32)" },
  2: { border: "rgba(236, 242, 255, 0.58)", glow: "rgba(210, 225, 255, 0.30)" },
  3: { border: "rgba(235, 165, 105, 0.58)", glow: "rgba(205, 127, 50, 0.30)" },
  4: { border: "rgba(228, 234, 245, 0.48)", glow: "rgba(200, 215, 235, 0.22)" },
  5: { border: "rgba(210, 220, 235, 0.40)", glow: "rgba(185, 200, 220, 0.18)" },
};

/** Bordo / glow per riquadri % nelle tile (stessa logica della sezione). */
export function getRailChrome(accent: ProbabilityRailAccent): { border: string; glow: string } {
  return RAIL_FALLBACK_CHROME[accent];
}

const SIZE: Record<
  "default" | "prominent" | "compact",
  { chrome: string; text: string }
> = {
  default: {
    chrome:
      "rounded-[10px] px-[0.56rem] py-[0.36rem] sm:px-[0.65rem] sm:py-[0.4rem]",
    text: "text-[1.12rem] sm:text-[1.22rem]",
  },
  prominent: {
    chrome:
      "rounded-[11px] px-[0.72rem] py-[0.42rem] sm:px-[0.85rem] sm:py-[0.46rem]",
    text: "text-[1.32rem] sm:text-[1.44rem]",
  },
  compact: {
    chrome: "rounded-[9px] px-[0.48rem] py-[0.3rem] sm:px-[0.54rem] sm:py-[0.34rem]",
    text: "text-[1.02rem] sm:text-[1.08rem]",
  },
};

export type ProbabilityBadgeSize = keyof typeof SIZE;

/**
 * % in bianco. Bordo da sezione (`railAccent`) o da posizione Top 5 (`topRank`).
 */
export function ProbabilityBadge({
  pct,
  size = "default",
  railAccent = "primary",
  topRank,
}: {
  pct: number;
  size?: ProbabilityBadgeSize;
  railAccent?: ProbabilityRailAccent;
  /** Se impostato (1–5), il bordo segue Tiffany / argento premium / bronzo / grigi come la card classifica. */
  topRank?: Top5Rank;
}) {
  const sz = SIZE[size];
  const resolved = topRank != null ? TOP5_RANK_CHROME[topRank] : RAIL_FALLBACK_CHROME[railAccent];

  return (
    <span
      className={[
        "relative isolate inline-flex shrink-0 overflow-hidden",
        "backdrop-blur-[16px]",
        "bg-[rgba(4,6,12,0.38)]",
        sz.chrome,
      ].join(" ")}
      style={{
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: resolved.border,
        boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.06), 0 10px 36px -16px ${resolved.glow}`,
      }}
    >
      <span
        className={[
          "relative font-kalshi font-semibold tabular-nums tracking-[-0.04em] antialiased leading-none select-none text-white",
          sz.text,
        ].join(" ")}
        style={{
          textShadow: "0 1px 12px rgba(0,0,0,0.92), 0 0 1px rgba(0,0,0,0.95)",
        }}
      >
        {pct}%
      </span>
    </span>
  );
}
