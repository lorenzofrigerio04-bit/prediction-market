"use client";

import type { SVGProps } from "react";

const iconClass = "shrink-0";
const stroke = 1.5;
const viewBox = "0 0 24 24";

function Icon({
  children,
  className = "",
  ...props
}: SVGProps<SVGSVGElement> & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={viewBox}
      strokeWidth={stroke}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${iconClass} ${className}`}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

/** Icone minimali per la barra nav inferiore: tratto sottile, forme essenziali */
function NavIcon({
  children,
  className = "",
  ...props
}: SVGProps<SVGSVGElement> & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={viewBox}
      strokeWidth={1.2}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${iconClass} ${className}`}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconChart({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </Icon>
  );
}

export function IconSearch({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </Icon>
  );
}

export function IconTarget({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </Icon>
  );
}

export function IconTrophy({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </Icon>
  );
}

export function IconUser({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Icon>
  );
}

/* —— Icone nav bottom: minimali e futuristiche, immediatamente riconoscibili —— */
export function IconNavHome({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <NavIcon className={className} {...props}>
      <path d="M12 3L4 10v11h6v-6h4v6h6V10L12 3z" />
    </NavIcon>
  );
}
export function IconNavDiscover({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <NavIcon className={className} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </NavIcon>
  );
}
export function IconNavWallet({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <NavIcon className={className} {...props}>
      <rect width="20" height="14" x="2" y="6" rx="2" />
      <path d="M6 12h4" />
    </NavIcon>
  );
}
/* Classifica: podio 1º 2º 3º — altezza in linea con le altre icone nav */
export function IconNavTrophy({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <NavIcon className={className} {...props}>
      <path d="M5 22V12h3v10H5z" />
      <path d="M10 22V6h4v16h-4z" />
      <path d="M16 22v-8h3v8h-3z" />
      <path d="M4 22h16" />
    </NavIcon>
  );
}
export function IconNavProfile({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <NavIcon className={className} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20v-2a5 5 0 0 1 14 0v2" />
    </NavIcon>
  );
}

export function IconMenu({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Icon>
  );
}

export function IconClose({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function IconBell({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </Icon>
  );
}

export function IconShop({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </Icon>
  );
}

export function IconChat({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Icon>
  );
}

export function IconCog({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Icon>
  );
}

export function IconShield({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Icon>
  );
}

export function IconLogout({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  );
}

export function IconLock({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  );
}

export function IconClock({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Icon>
  );
}

export function IconChevronRight({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  );
}

export function IconWallet({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </Icon>
  );
}

export function IconGift({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M20 12v10H4V12" />
      <rect width="20" height="5" x="2" y="7" />
      <path d="M12 22V7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </Icon>
  );
}

export function IconSparkles({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </Icon>
  );
}

export function IconCalendar({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </Icon>
  );
}

export function IconCalendarDays({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 14h.01" />
      <path d="M11 14h.01" />
      <path d="M15 14h.01" />
      <path d="M7 18h.01" />
      <path d="M11 18h.01" />
      <path d="M15 18h.01" />
    </Icon>
  );
}

export function IconCheck({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

export function IconTrendUp({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </Icon>
  );
}

export function IconTrendDown({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="m22 17-8.5-8.5-5 5L2 7" />
      <path d="M16 17h6v-6" />
    </Icon>
  );
}

export function IconCurrency({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </Icon>
  );
}

export function IconEye({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </Icon>
  );
}

export function IconClipboard({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </Icon>
  );
}

export function IconArrowRight({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <Icon className={className} {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </Icon>
  );
}
