"use client";

/**
 * Premium odds display component.
 *
 * Renders three visual variants:
 * - `match`: home / draw / away (3 pills) for binary match questions
 * - `binary`: SI / NO (2 pills) for generic yes/no markets
 * - `multi`: up to N ranked rows for multi-outcome markets
 */

import type { FootballEvent } from "@/types/homepage";
import { parseSportMatchTitle } from "@/lib/sport-match-title";

interface Props {
  event: FootballEvent;
  /** Max rows for multi-outcome display. Defaults to 3. */
  multiMaxRows?: number;
  /** Compact mode (smaller numbers). */
  compact?: boolean;
}

// ─── utilities ─────────────────────────────────────────────────────────────

function pct(n: number | undefined | null): number {
  const v = typeof n === "number" ? Math.round(n) : 0;
  return Math.max(0, Math.min(100, v));
}

function bestOfTris(
  probs: Array<{ key: string; label: string; probabilityPct: number }>
) {
  const home = probs.find((p) => /^(1|home)$/i.test(p.key));
  const draw = probs.find((p) => /^(x|draw|pareggio)$/i.test(p.key));
  const away = probs.find((p) => /^(2|away)$/i.test(p.key));
  if (home && draw && away) {
    return { home, draw, away };
  }
  return null;
}

// ─── sub-components ────────────────────────────────────────────────────────

function OddPillLarge({
  label,
  pct: p,
  tone = "neutral",
  emphasis = false,
  compact = false,
}: {
  label: string;
  pct: number;
  tone?: "neutral" | "success" | "danger";
  emphasis?: boolean;
  compact?: boolean;
}) {
  const toneText =
    tone === "success"
      ? "text-emerald-300"
      : tone === "danger"
      ? "text-rose-300"
      : "text-white/90";
  const toneGlow = emphasis
    ? tone === "success"
      ? "from-emerald-500/20 to-emerald-500/0"
      : tone === "danger"
      ? "from-rose-500/20 to-rose-500/0"
      : "from-primary/18 to-primary/0"
    : "from-white/[0.07] to-white/0";
  const toneBorder = emphasis
    ? tone === "success"
      ? "border-emerald-400/40"
      : tone === "danger"
      ? "border-rose-400/40"
      : "border-primary/40"
    : "border-white/10";

  return (
    <div
      className={[
        "group relative flex min-w-0 flex-col items-center justify-center overflow-hidden rounded-xl border backdrop-blur-sm",
        toneBorder,
        "bg-white/[0.04] px-2 transition-colors",
        compact ? "py-2" : "py-2.5",
      ].join(" ")}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b ${toneGlow}`}
      />
      <span
        className={[
          "relative z-10 font-numeric font-extrabold tabular-nums tracking-[0.01em]",
          compact ? "text-[0.95rem]" : "text-[1.15rem] sm:text-[1.3rem]",
          toneText,
        ].join(" ")}
      >
        {p}
        <span className="text-[0.6em] font-semibold opacity-75">%</span>
      </span>
      <span
        className={[
          "relative z-10 mt-0.5 font-[Oswald] font-semibold uppercase text-white/55",
          compact ? "text-[8px] tracking-[0.10em]" : "text-[10px] tracking-[0.18em]",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

function MultiRow({
  label,
  pct: p,
  rank,
  compact,
}: {
  label: string;
  pct: number;
  rank: number;
  compact?: boolean;
}) {
  const leader = rank === 1;
  return (
    <div className="flex items-center gap-2">
      <span
        className={[
          "shrink-0 text-right font-numeric font-bold tabular-nums",
          compact ? "w-3 text-[10px]" : "w-4 text-[11px]",
          leader ? "text-primary" : "text-white/30",
        ].join(" ")}
      >
        {rank}
      </span>
      <span
        className={[
          "min-w-0 flex-1 truncate font-medium",
          compact ? "text-[11.5px]" : "text-[13px]",
          leader ? "text-white/95" : "text-white/75",
        ].join(" ")}
      >
        {label}
      </span>
      <div
        className={[
          "relative h-1 shrink-0 overflow-hidden rounded-full bg-white/[0.08]",
          compact ? "w-10" : "w-16",
        ].join(" ")}
      >
        <div
          className={[
            "absolute inset-y-0 left-0 rounded-full transition-[width] duration-500",
            leader
              ? "bg-primary shadow-[0_0_8px_rgba(80,245,252,0.6)]"
              : "bg-white/40",
          ].join(" ")}
          style={{ width: `${p}%` }}
        />
      </div>
      <span
        className={[
          "shrink-0 text-right font-numeric font-bold tabular-nums",
          compact ? "w-8 text-[10.5px]" : "w-9 text-[12px]",
          leader ? "text-primary" : "text-white/70",
        ].join(" ")}
      >
        {p}%
      </span>
    </div>
  );
}

// ─── main ──────────────────────────────────────────────────────────────────

export function OddsBlock({ event, multiMaxRows = 3, compact = false }: Props) {
  const { marketType, outcomeProbabilities, title, yesPct } = event;

  // Variant 1: match (home/draw/away tris from multi-outcome result market)
  if (outcomeProbabilities && outcomeProbabilities.length >= 3) {
    const tris = bestOfTris(outcomeProbabilities);
    if (tris) {
      const teams = parseSportMatchTitle(title);
      const homeLabel = teams?.teamA ?? tris.home.label;
      const awayLabel = teams?.teamB ?? tris.away.label;
      return (
        <div className="grid grid-cols-3 gap-1.5">
          <OddPillLarge
            label={homeLabel}
            pct={pct(tris.home.probabilityPct)}
            emphasis={tris.home.probabilityPct >= tris.draw.probabilityPct && tris.home.probabilityPct >= tris.away.probabilityPct}
            compact={compact}
          />
          <OddPillLarge
            label="Pareggio"
            pct={pct(tris.draw.probabilityPct)}
            emphasis={tris.draw.probabilityPct > tris.home.probabilityPct && tris.draw.probabilityPct > tris.away.probabilityPct}
            compact={compact}
          />
          <OddPillLarge
            label={awayLabel}
            pct={pct(tris.away.probabilityPct)}
            emphasis={tris.away.probabilityPct > tris.home.probabilityPct && tris.away.probabilityPct >= tris.draw.probabilityPct}
            compact={compact}
          />
        </div>
      );
    }
  }

  // Variant 2: multi-outcome ranked rows
  if (outcomeProbabilities && outcomeProbabilities.length >= 2) {
    const sorted = [...outcomeProbabilities].sort(
      (a, b) => b.probabilityPct - a.probabilityPct
    );
    const top = sorted.slice(0, multiMaxRows);
    const rest = sorted.length - top.length;
    return (
      <div className="space-y-1.5">
        {top.map((p, i) => (
          <MultiRow
            key={p.key}
            label={p.label}
            pct={pct(p.probabilityPct)}
            rank={i + 1}
            compact={compact}
          />
        ))}
        {rest > 0 && (
          <p className="pt-0.5 text-[10.5px] text-white/35">
            +{rest} altre opzioni
          </p>
        )}
      </div>
    );
  }

  // Variant 3: binary SI/NO
  const yes = pct(yesPct);
  const no = 100 - yes;
  const _marketType = marketType ?? "";
  void _marketType;
  return (
    <div className="grid grid-cols-2 gap-1.5">
      <OddPillLarge
        label="Sì"
        pct={yes}
        tone="success"
        emphasis={yes >= no}
        compact={compact}
      />
      <OddPillLarge
        label="No"
        pct={no}
        tone="danger"
        emphasis={no > yes}
        compact={compact}
      />
    </div>
  );
}
