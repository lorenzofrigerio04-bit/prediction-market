"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LandingBackgroundCarousel from "@/components/landing/LandingBackgroundCarousel";

/**
 * Sfondo globale: carosello foto categorie (blur + crossfade) su tutte le pagine
 * tranne il feed Consigliati full-screen (/discover con tab per-te) che ha già le sue foto.
 * Eventi seguiti (/discover?tab=seguiti) e visione generale (/discover/consigliati) hanno lo sfondo carosello.
 * Usa mounted per evitare hydration mismatch: server e client devono rendere lo stesso output al primo paint.
 */
export default function AppBackground() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const isConsigliatiFeed = pathname === "/discover" && tab !== "seguiti";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prima del mount: stesso output su server e client (sempre carosello) per evitare hydration error
  if (!mounted) return <LandingBackgroundCarousel />;
  if (isConsigliatiFeed) return null;
  return <LandingBackgroundCarousel />;
}
