"use client";

/** Stessi accent dei rail `HomeEventCard` / sezioni homepage. */
export type ProbabilityRailAccent =
  | "primary"
  | "gold"
  | "rose"
  | "violet"
  | "emerald"
  | "cyan";

const RAIL_PALETTE: Record<
  ProbabilityRailAccent,
  {
    textCls: string;
    textGlow: string;
    hue: string;
  }
> = {
  primary: {
    textCls: "text-primary",
    textGlow: "0 0 22px rgba(80, 245, 252, 0.48)",
    hue: "shadow-[0_0_28px_-6px_rgba(80,245,252,0.42)]",
  },
  gold: {
    textCls: "text-amber-300",
    textGlow: "0 0 22px rgba(252, 211, 77, 0.45)",
    hue: "shadow-[0_0_28px_-6px_rgba(252,211,77,0.4)]",
  },
  rose: {
    textCls: "text-rose-400",
    textGlow: "0 0 22px rgba(244, 63, 94, 0.45)",
    hue: "shadow-[0_0_28px_-6px_rgba(244,63,94,0.4)]",
  },
  violet: {
    textCls: "text-violet-300",
    textGlow: "0 0 22px rgba(167, 139, 250, 0.45)",
    hue: "shadow-[0_0_28px_-6px_rgba(167,139,250,0.4)]",
  },
  emerald: {
    textCls: "text-emerald-400",
    textGlow: "0 0 22px rgba(52, 211, 153, 0.45)",
    hue: "shadow-[0_0_28px_-6px_rgba(52,211,153,0.4)]",
  },
  cyan: {
    textCls: "text-cyan-400",
    textGlow: "0 0 22px rgba(34, 211, 238, 0.45)",
    hue: "shadow-[0_0_28px_-6px_rgba(34,211,238,0.4)]",
  },
};

const TOP5_WHITE = {
  textCls: "text-white",
  textGlow: "0 0 20px rgba(255, 255, 255, 0.28)",
  hue: "shadow-[0_0_24px_-8px_rgba(255,255,255,0.18)]",
} as const;

const SIZE: Record<
  "default" | "prominent" | "compact",
  { chrome: string; text: string }
> = {
  default: {
    chrome:
      "rounded-[11px] px-[0.62rem] py-[0.42rem] sm:px-[0.72rem] sm:py-[0.45rem]",
    text: "text-[1.2rem] sm:text-[1.3rem]",
  },
  prominent: {
    chrome:
      "rounded-[13px] px-[0.78rem] py-[0.48rem] sm:px-[0.92rem] sm:py-[0.52rem]",
    text: "text-[1.44rem] sm:text-[1.58rem]",
  },
  compact: {
    chrome: "rounded-[10px] px-[0.52rem] py-[0.34rem] sm:px-[0.6rem] sm:py-[0.38rem]",
    text: "text-[1.08rem] sm:text-[1.15rem]",
  },
};

export type ProbabilityBadgeSize = keyof typeof SIZE;

/**
 * Top 5: numero sempre bianco (`variant="top5"`).
 * Altri rail: colore dell’accento di sezione (`variant="rail"` + `railAccent`).
 */
export function ProbabilityBadge({
  pct,
  size = "default",
  variant = "rail",
  railAccent = "primary",
}: {
  pct: number;
  size?: ProbabilityBadgeSize;
  variant?: "top5" | "rail";
  railAccent?: ProbabilityRailAccent;
}) {
  const palette = variant === "top5" ? TOP5_WHITE : RAIL_PALETTE[railAccent];
  const sz = SIZE[size];

  return (
    <span
      className={[
        "relative isolate inline-flex shrink-0 overflow-hidden backdrop-blur-md",
        "border border-white/[0.13]",
        "bg-[linear-gradient(155deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_38%,rgba(0,0,0,0.35)_110%)]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.38),0_10px_32px_-12px_rgba(0,0,0,0.78)]",
        palette.hue,
        sz.chrome,
      ].join(" ")}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[10%] top-px h-px rounded-full bg-gradient-to-r from-transparent via-white/[0.22] to-transparent"
      />

      <span
        className={[
          "relative font-kalshi font-bold tabular-nums tracking-[-0.055em] antialiased leading-none select-none",
          sz.text,
          palette.textCls,
        ].join(" ")}
        style={{
          textShadow: `${palette.textGlow}, 0 2px 14px rgba(0,0,0,0.92), 0 1px 0 rgba(0,0,0,0.55)`,
        }}
      >
        {pct}%
      </span>
    </span>
  );
}
