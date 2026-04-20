"use client";

import { useEffect, useState } from "react";

interface Props {
  /** ISO date when the market closes. */
  closesAt: string;
  /** Visual size. `sm` = for overlays on covers, `md` = for card footer. */
  size?: "sm" | "md";
  /** Variant of chrome: `glass` (default, for on-cover) or `inline` (for footer). */
  variant?: "glass" | "inline";
}

function formatParts(msLeft: number): { value: string; label: string } {
  if (msLeft <= 0) return { value: "CHIUSO", label: "" };
  const totalMin = Math.floor(msLeft / 60_000);
  const days = Math.floor(totalMin / (60 * 24));
  const hours = Math.floor((totalMin % (60 * 24)) / 60);
  const minutes = totalMin % 60;
  if (days >= 1) {
    return {
      value: `${days}g ${hours.toString().padStart(2, "0")}h`,
      label: "chiude",
    };
  }
  if (hours >= 1) {
    return {
      value: `${hours}h ${minutes.toString().padStart(2, "0")}m`,
      label: "chiude",
    };
  }
  return {
    value: `${minutes}m`,
    label: "chiude",
  };
}

/** urgency -> color theme */
function urgencyClasses(msLeft: number): {
  border: string;
  text: string;
  dot: string;
  bg: string;
} {
  if (msLeft <= 0)
    return {
      border: "border-white/15",
      text: "text-white/45",
      dot: "bg-white/40",
      bg: "bg-white/[0.04]",
    };
  if (msLeft < 60 * 60 * 1000) {
    return {
      border: "border-rose-400/35",
      text: "text-rose-200",
      dot: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.7)]",
      bg: "bg-rose-500/[0.12]",
    };
  }
  if (msLeft < 6 * 60 * 60 * 1000) {
    return {
      border: "border-amber-300/35",
      text: "text-amber-100",
      dot: "bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.55)]",
      bg: "bg-amber-400/[0.10]",
    };
  }
  return {
    border: "border-white/15",
    text: "text-white/75",
    dot: "bg-white/60",
    bg: "bg-white/[0.06]",
  };
}

export function CountdownPill({
  closesAt,
  size = "sm",
  variant = "glass",
}: Props) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const msLeft = new Date(closesAt).getTime() - now;
  const parts = formatParts(msLeft);
  const u = urgencyClasses(msLeft);
  const isSm = size === "sm";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md",
        u.border,
        u.text,
        variant === "glass" ? "bg-black/40" : u.bg,
        isSm ? "px-2 py-[3px]" : "px-2.5 py-1",
      ].join(" ")}
      title="Chiusura mercato"
    >
      <span
        className={`inline-block rounded-full ${u.dot} ${
          isSm ? "h-1.5 w-1.5" : "h-2 w-2"
        }`}
        aria-hidden
      />
      {parts.label && (
        <span
          className={[
            "font-[Oswald] uppercase tracking-[0.22em]",
            isSm ? "text-[9px]" : "text-[10px]",
            "opacity-75",
          ].join(" ")}
        >
          {parts.label}
        </span>
      )}
      <span
        className={[
          "font-numeric font-semibold tabular-nums",
          isSm ? "text-[11px]" : "text-[12.5px]",
        ].join(" ")}
      >
        {parts.value}
      </span>
    </span>
  );
}
