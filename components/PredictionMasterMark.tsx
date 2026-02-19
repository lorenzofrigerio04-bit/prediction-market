import React from "react";
import Link from "next/link";

type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

export function PredictionMasterIcon({ className, title, ...props }: IconProps) {
  // Icona: prisma + barre + orbita (back/front) + sfera.
  // Colori: currentColor + var(--primary) / var(--primary-glow) via CSS (nessun hex hardcoded).
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}

      {/* Back orbit (dietro al core) */}
      <path
        d="M16 74c8-24 33-42 58-42 22 0 36 10 46 22"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="8"
        strokeLinecap="round"
      />

      {/* Core prism */}
      <path
        d="M56 20 34 86h22l10-22 10 22h22L72 20Z"
        fill="currentColor"
        fillOpacity="0.92"
      />

      {/* Prism highlight (subtle) */}
      <path
        d="M56 20 44 60l12-6 12 6L56 20Z"
        fill="currentColor"
        fillOpacity="0.18"
      />

      {/* Bars (growth) */}
      <g fill="currentColor" fillOpacity="0.72">
        <rect x="40" y="74" width="8" height="16" rx="2" />
        <rect x="52" y="66" width="8" height="24" rx="2" />
        <rect x="64" y="58" width="8" height="32" rx="2" />
        <rect x="76" y="70" width="8" height="20" rx="2" />
      </g>

      {/* Front orbit (davanti al core) */}
      <path
        d="M14 78c10 18 30 30 55 30 23 0 41-9 51-22"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.55"
        strokeWidth="10"
        strokeLinecap="round"
      />

      {/* Orbit accent stroke (primary) */}
      <path
        d="M18 79c9 14 28 24 51 24 21 0 37-7 47-17"
        fill="none"
        stroke="rgb(var(--primary))"
        strokeOpacity="0.55"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Orb (sphere) */}
      <circle
        cx="104"
        cy="54"
        r="8"
        fill="rgb(var(--primary))"
        fillOpacity="0.85"
      />
      <circle
        cx="101"
        cy="51"
        r="3"
        fill="currentColor"
        fillOpacity="0.22"
      />
    </svg>
  );
}

export function PredictionMasterLogo() {
  return (
    <Link
      href="/"
      className={[
        "group inline-flex min-h-[44px] items-center gap-2 rounded-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "transition duration-ds-normal ease-ds-ease",
      ].join(" ")}
      aria-label="PredictionMaster"
    >
      <PredictionMasterIcon
        className={[
          "h-9 w-9 shrink-0 md:h-10 md:w-10",
          "text-fg",
          "transition duration-ds-normal ease-ds-ease",
          "dark:drop-shadow-[0_0_20px_rgba(var(--primary-glow),0.12)]",
          "group-hover:dark:drop-shadow-[0_0_22px_rgba(var(--primary-glow),0.18)]",
        ].join(" ")}
      />
      <span
        className={[
          "text-ds-h2 font-bold tracking-headline text-fg",
          "transition duration-ds-normal ease-ds-ease",
          "group-hover:text-fg",
        ].join(" ")}
      >
        PredictionMaster
      </span>
    </Link>
  );
}
