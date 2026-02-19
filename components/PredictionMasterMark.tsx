import React from "react";
import Link from "next/link";

type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

export function PredictionMasterIcon({ className, title, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}

      <defs>
        {/* Prism gradient: cyan -> blue -> violet (render-like, not rainbow) */}
        <linearGradient id="pmPrism" x1="32" y1="96" x2="96" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(var(--primary))" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="rgb(var(--primary))" stopOpacity="0.70" />
          <stop offset="1" stopColor="rgb(var(--primary-glow))" stopOpacity="0.95" />
        </linearGradient>

        {/* Orbit gradient */}
        <linearGradient id="pmOrbit" x1="18" y1="86" x2="110" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(var(--primary))" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="1" stopColor="rgb(var(--primary-glow))" stopOpacity="0.55" />
        </linearGradient>

        {/* Orb gradient */}
        <radialGradient id="pmOrb" cx="35%" cy="35%" r="70%">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="0.35" stopColor="rgb(var(--primary))" stopOpacity="0.95" />
          <stop offset="1" stopColor="rgb(var(--primary-glow))" stopOpacity="0.85" />
        </radialGradient>

        {/* Subtle glow filter (kept minimal). In light it will be barely visible due to low opacity. */}
        <filter id="pmGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="
              1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 0.25 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Mask to simulate orbit going behind the prism */}
        <mask id="pmBehindMask">
          {/* show everything */}
          <rect x="0" y="0" width="128" height="128" fill="white" />
          {/* hide where prism sits (so 'behind' orbit disappears there) */}
          <path d="M64 18 38 90h24l2-6 2 6h24L64 18Z" fill="black" />
        </mask>
      </defs>

      {/* BACK ORBIT (goes behind prism) */}
      <g mask="url(#pmBehindMask)" opacity="0.9">
        <path
          d="M14 74c10-26 38-44 64-44 24 0 39 10 50 24"
          fill="none"
          stroke="url(#pmOrbit)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeOpacity="0.55"
        />
      </g>

      {/* PRISM CORE (triangular) */}
      <g filter="url(#pmGlow)">
        <path
          d="M64 18 38 90h24l2-6 2 6h24L64 18Z"
          fill="url(#pmPrism)"
        />
        {/* inner facets for 3D hint */}
        <path
          d="M64 18 50 60l14-7 14 7L64 18Z"
          fill="currentColor"
          opacity="0.10"
        />
        <path
          d="M50 60 38 90h24l2-6-14-24Z"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M78 60 90 90H66l-2-6 14-24Z"
          fill="currentColor"
          opacity="0.06"
        />

        {/* Bars (crystalline, slightly rounded) */}
        <g opacity="0.9">
          <rect x="46" y="76" width="7" height="14" rx="2.2" fill="currentColor" opacity="0.45" />
          <rect x="56" y="68" width="7" height="22" rx="2.2" fill="currentColor" opacity="0.55" />
          <rect x="66" y="60" width="7" height="30" rx="2.2" fill="currentColor" opacity="0.68" />
          <rect x="76" y="72" width="7" height="18" rx="2.2" fill="currentColor" opacity="0.50" />
        </g>
      </g>

      {/* FRONT ORBIT (in front, slightly stronger) */}
      <path
        d="M12 78c12 20 35 32 62 32 25 0 44-9 54-24"
        fill="none"
        stroke="url(#pmOrbit)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeOpacity="0.72"
      />

      {/* ORB (satellite sphere) */}
      <g filter="url(#pmGlow)">
        <circle cx="104" cy="52" r="8.5" fill="url(#pmOrb)" />
        <circle cx="101" cy="49" r="2.8" fill="currentColor" opacity="0.22" />
      </g>
    </svg>
  );
}

export function PredictionMasterLogo() {
  return (
    <Link
      href="/"
      aria-label="PredictionMaster"
      className={[
        "group inline-flex min-h-[44px] items-center gap-2 rounded-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "transition duration-ds-normal ease-ds-ease",
      ].join(" ")}
    >
      <PredictionMasterIcon
        className={[
          "h-9 w-9 shrink-0 md:h-10 md:w-10",
          "text-fg",
          "transition duration-ds-normal ease-ds-ease",
          "dark:drop-shadow-[0_0_18px_rgba(var(--primary-glow),0.12)]",
          "group-hover:dark:drop-shadow-[0_0_22px_rgba(var(--primary-glow),0.18)]",
        ].join(" ")}
      />
      <span
        className={[
          "text-ds-h2 font-bold tracking-headline text-fg",
          "transition duration-ds-normal ease-ds-ease",
        ].join(" ")}
      >
        PredictionMaster
      </span>
    </Link>
  );
}
