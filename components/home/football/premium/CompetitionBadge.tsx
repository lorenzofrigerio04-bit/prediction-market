"use client";

/**
 * Premium competition badge with league-specific color treatment.
 * Sizes: sm (micro, overlay on cover), md (standalone).
 */

interface Props {
  league?: string | null;
  category?: string;
  size?: "sm" | "md";
  variant?: "solid" | "ghost";
}

type Theme = {
  /** left colored strip */
  strip: string;
  /** text color for label */
  label: string;
  /** ghost border color */
  border: string;
  /** solid background (tinted glass) */
  solidBg: string;
};

function themeFor(label: string): Theme {
  const l = label.toLowerCase();
  if (l.includes("champion") || l.includes("ucl")) {
    return {
      strip: "bg-amber-300",
      label: "text-amber-200",
      border: "border-amber-300/25",
      solidBg: "bg-amber-500/[0.08]",
    };
  }
  if (l.includes("europa") || l.includes("uel")) {
    return {
      strip: "bg-orange-400",
      label: "text-orange-200",
      border: "border-orange-400/25",
      solidBg: "bg-orange-500/[0.08]",
    };
  }
  if (l.includes("conference")) {
    return {
      strip: "bg-emerald-400",
      label: "text-emerald-200",
      border: "border-emerald-400/25",
      solidBg: "bg-emerald-500/[0.08]",
    };
  }
  if (l.includes("serie a")) {
    return {
      strip: "bg-sky-400",
      label: "text-sky-200",
      border: "border-sky-400/25",
      solidBg: "bg-sky-500/[0.08]",
    };
  }
  if (l.includes("premier")) {
    return {
      strip: "bg-violet-400",
      label: "text-violet-200",
      border: "border-violet-400/25",
      solidBg: "bg-violet-500/[0.08]",
    };
  }
  if (l.includes("liga") || l.includes("laliga")) {
    return {
      strip: "bg-rose-400",
      label: "text-rose-200",
      border: "border-rose-400/25",
      solidBg: "bg-rose-500/[0.08]",
    };
  }
  if (l.includes("bundes")) {
    return {
      strip: "bg-yellow-300",
      label: "text-yellow-200",
      border: "border-yellow-300/25",
      solidBg: "bg-yellow-500/[0.08]",
    };
  }
  if (l.includes("ligue")) {
    return {
      strip: "bg-indigo-300",
      label: "text-indigo-200",
      border: "border-indigo-300/25",
      solidBg: "bg-indigo-500/[0.08]",
    };
  }
  if (l.includes("mondial") || l.includes("world cup") || l.includes("fifa")) {
    return {
      strip: "bg-teal-300",
      label: "text-teal-200",
      border: "border-teal-300/25",
      solidBg: "bg-teal-500/[0.08]",
    };
  }
  if (l.includes("euro") || l.includes("nations")) {
    return {
      strip: "bg-cyan-300",
      label: "text-cyan-200",
      border: "border-cyan-300/25",
      solidBg: "bg-cyan-500/[0.08]",
    };
  }
  return {
    strip: "bg-white/50",
    label: "text-white/70",
    border: "border-white/15",
    solidBg: "bg-white/[0.06]",
  };
}

export function CompetitionBadge({
  league,
  category,
  size = "sm",
  variant = "ghost",
}: Props) {
  const label = (league ?? category ?? "").trim() || "Calcio";
  const t = themeFor(label);
  const isSm = size === "sm";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-md border backdrop-blur-md",
        variant === "solid" ? t.solidBg : "bg-black/35",
        t.border,
        isSm ? "px-1.5 py-[3px]" : "px-2 py-1",
      ].join(" ")}
    >
      <span
        className={`inline-block rounded-[1px] ${t.strip} ${
          isSm ? "h-[9px] w-[2px]" : "h-3 w-[2.5px]"
        }`}
        aria-hidden
      />
      <span
        className={[
          "font-[Oswald] font-semibold uppercase",
          isSm
            ? "text-[9.5px] tracking-[0.18em]"
            : "text-[11px] tracking-[0.18em]",
          t.label,
        ].join(" ")}
      >
        {label}
      </span>
    </span>
  );
}
