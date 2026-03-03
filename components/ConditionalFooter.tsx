"use client";

import { usePathname } from "next/navigation";

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === "/oracle") return null;
  return (
    <footer
      className="py-3 text-center text-fg-muted text-ds-micro bg-transparent relative z-10"
      aria-hidden
    >
      <span className="brand-logo__text tracking-tight inline-block text-xs md:text-sm">
        <span className="brand-logo__word brand-logo__word--prediction">Prediction</span>
        <span className="brand-logo__word brand-logo__word--master">Master</span>
      </span>
    </footer>
  );
}
