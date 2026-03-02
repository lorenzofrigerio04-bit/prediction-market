"use client";

import { useState, useEffect } from "react";
import LandingBackgroundCarousel from "@/components/landing/LandingBackgroundCarousel";

/**
 * Sfondo globale: carosello foto categorie (blur + crossfade) su tutte le pagine.
 * Feed 2.0: /discover è un unico feed a scroll, con lo stesso sfondo carosello.
 * Usa mounted per evitare hydration mismatch: server e client devono rendere lo stesso output al primo paint.
 */
export default function AppBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <LandingBackgroundCarousel />;
  return <LandingBackgroundCarousel />;
}
