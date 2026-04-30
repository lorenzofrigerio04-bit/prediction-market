"use client";

import { formatEventExpiryShort } from "@/lib/format-event-expiry";
import { getRailChrome, type ProbabilityRailAccent } from "./ProbabilityBadge";

/** Stesso chrome di `ProbabilityBadge` size `prominent` — allineamento verticale con il box %. */
const PROMINENT_CHROME =
  "rounded-[11px] px-[0.72rem] py-[0.42rem] sm:px-[0.85rem] sm:py-[0.46rem]";

export function ExpiryCoverBadge({
  closesAt,
  railAccent,
}: {
  closesAt: string;
  railAccent: ProbabilityRailAccent;
}) {
  const resolved = getRailChrome(railAccent);
  const value = formatEventExpiryShort(closesAt);
  const line = `CHIUDE ${value.toUpperCase()}`;

  return (
    <span
      className={[
        "relative isolate inline-flex shrink-0 items-center overflow-hidden whitespace-nowrap",
        "backdrop-blur-[16px]",
        "bg-[rgba(4,6,12,0.38)]",
        PROMINENT_CHROME,
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
          "text-[1.14rem] sm:text-[1.26rem]",
        ].join(" ")}
        style={{
          textShadow: "0 1px 12px rgba(0,0,0,0.92), 0 0 1px rgba(0,0,0,0.95)",
        }}
      >
        {line}
      </span>
    </span>
  );
}
