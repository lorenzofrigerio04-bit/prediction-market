"use client";

import { usePathname, useSearchParams } from "next/navigation";
import LandingBackgroundCarousel from "@/components/landing/LandingBackgroundCarousel";

/**
 * Sfondo globale: carosello foto categorie (blur + crossfade) su tutte le pagine
 * tranne il feed Consigliati full-screen (/discover con tab per-te) che ha già le sue foto.
 * Eventi seguiti (/discover?tab=seguiti) e visione generale (/discover/consigliati) hanno lo sfondo carosello.
 */
export default function AppBackground() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const isConsigliatiFeed = pathname === "/discover" && tab !== "seguiti";

  if (isConsigliatiFeed) return null;

  return <LandingBackgroundCarousel />;
}
