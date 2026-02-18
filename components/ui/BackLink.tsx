"use client";

import { useRouter } from "next/navigation";
import { ReactNode, MouseEvent } from "react";

interface BackLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

/**
 * Link che torna alla pagina precedente (history.back).
 * Usa `href` come fallback se non c'è storia (es. apertura in nuovo tab).
 */
export default function BackLink({ href, children, className }: BackLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
