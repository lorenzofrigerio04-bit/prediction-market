"use client";

import { useId, type SVGProps } from "react";

type VirtualCreditsGlyphProps = SVGProps<SVGSVGElement> & {
  className?: string;
  "aria-hidden"?: boolean;
};

/** Stesso marchio $
 *  virtuale dell’header (pill crediti) — gradient Tiffany. */
export default function VirtualCreditsGlyph({ className = "size-[15px] shrink-0", ...rest }: VirtualCreditsGlyphProps) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...rest}>
      <defs>
        <linearGradient id={gid} x1="4" y1="5" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(226,254,252,1)" />
          <stop offset="0.42" stopColor="rgba(64,219,209,1)" />
          <stop offset="1" stopColor="rgba(12,118,114,1)" />
        </linearGradient>
      </defs>
      <path
        d="M17 5.25H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6.25"
        stroke={`url(#${gid})`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 3.15v6.55M12 14.3v6.55" stroke={`url(#${gid})`} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
