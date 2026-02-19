"use client";

import React from "react";
import Link from "next/link";

type IconProps = React.SVGProps<SVGSVGElement> & { title?: string };

export function PredictionMasterIcon({ className, title, ...props }: IconProps) {
  const idPrefix = React.useId().replace(/:/g, "");
  const idPrism = `${idPrefix}pm-prism`;
  const idOrbit = `${idPrefix}pm-orbit`;
  const idOrb = `${idPrefix}pm-orb`;
  const idGlow = `${idPrefix}pm-glow`;
  const idBehindMask = `${idPrefix}pm-behind`;

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
        {/* Prism: metallic silver, light from top-left (white highlight -> grey shadow) */}
        <linearGradient
          id={idPrism}
          x1="38"
          y1="24"
          x2="90"
          y2="88"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#e2e8f0" stopOpacity="0.9" />
          <stop offset="0.65" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.88" />
        </linearGradient>

        {/* Orbit: metallic band, highlight on top-right curve */}
        <linearGradient
          id={idOrbit}
          x1="18"
          y1="86"
          x2="110"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="currentColor" stopOpacity="0.4" />
          <stop offset="0.45" stopColor="#cbd5e1" stopOpacity="0.85" />
          <stop offset="0.7" stopColor="#f8fafc" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
        </linearGradient>

        {/* Orb: specular highlight top-left, metallic sphere */}
        <radialGradient id={idOrb} cx="32%" cy="32%" r="68%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="0.25" stopColor="#e2e8f0" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.85" />
        </radialGradient>

        {/* Soft glow (neutral blur; blue-white glow from CSS drop-shadow on wrapper) */}
        <filter id={idGlow} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.2 0"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Mask: orbit segment behind prism */}
        <mask id={idBehindMask}>
          <rect x="0" y="0" width="128" height="128" fill="white" />
          <path d="M64 18 38 90h24l2-6 2 6h24L64 18Z" fill="black" />
        </mask>
      </defs>

      {/* BACK ORBIT (behind prism) */}
      <g mask={`url(#${idBehindMask})`} opacity="0.92">
        <path
          d="M14 74c10-26 38-44 64-44 24 0 39 10 50 24"
          fill="none"
          stroke={`url(#${idOrbit})`}
          strokeWidth="10"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
      </g>

      {/* PRISM (triangular, metallic) */}
      <g filter={`url(#${idGlow})`}>
        <path
          d="M64 18 38 90h24l2-6 2 6h24L64 18Z"
          fill={`url(#${idPrism})`}
        />
        {/* Inner facets for 3D */}
        <path
          d="M64 18 50 60l14-7 14 7L64 18Z"
          fill="currentColor"
          opacity="0.08"
        />
        <path
          d="M50 60 38 90h24l2-6-14-24Z"
          fill="currentColor"
          opacity="0.06"
        />
        <path
          d="M78 60 90 90H66l-2-6 14-24Z"
          fill="currentColor"
          opacity="0.05"
        />

        {/* Growth bars (metallic, inside prism) */}
        <g opacity="0.88">
          <rect x="46" y="76" width="7" height="14" rx="2.2" fill="currentColor" opacity="0.42" />
          <rect x="56" y="68" width="7" height="22" rx="2.2" fill="currentColor" opacity="0.52" />
          <rect x="66" y="60" width="7" height="30" rx="2.2" fill="currentColor" opacity="0.62" />
          <rect x="76" y="72" width="7" height="18" rx="2.2" fill="currentColor" opacity="0.48" />
        </g>
      </g>

      {/* FRONT ORBIT (in front of prism) */}
      <path
        d="M12 78c12 20 35 32 62 32 25 0 44-9 54-24"
        fill="none"
        stroke={`url(#${idOrbit})`}
        strokeWidth="12"
        strokeLinecap="round"
        strokeOpacity="0.78"
      />

      {/* ORB (satellite sphere with specular) */}
      <g filter={`url(#${idGlow})`}>
        <circle cx="104" cy="52" r="8.5" fill={`url(#${idOrb})`} />
        <circle cx="101" cy="49" r="2.6" fill="#fff" opacity="0.35" />
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
        "brand-logo group inline-flex min-h-[44px] items-center rounded-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "transition duration-ds-normal ease-ds-ease",
      ].join(" ")}
    >
      <span className="brand-logo__text font-display text-xl md:text-2xl font-extrabold tracking-tight">
        <span className="brand-logo__word brand-logo__word--prediction">Prediction</span>
        <span className="brand-logo__word brand-logo__word--master">Master</span>
      </span>
    </Link>
  );
}
