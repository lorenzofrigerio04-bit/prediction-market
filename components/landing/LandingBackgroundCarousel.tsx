"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Sfondo homepage prelogin: tutte le foto di sfondo delle pagine evento (per categoria)
 * a tutto schermo, in sfocatura, che si alternano in crossfade per dare un'anteprima della piattaforma.
 */

export const CATEGORY_BACKGROUNDS = [
  "/images/event-cultura-bg.png",
  "/images/event-economia-bg.png",
  "/images/event-intrattenimento-bg.png",
  "/images/event-sport-bg.png",
  "/images/event-tecnologia-bg.png",
  "/images/event-scienza-bg.png",
  "/images/event-politica-bg.png",
] as const;

/** Indice dello sfondo per categoria (stesso ordine di CATEGORY_BACKGROUNDS). Per bloccare la pagina sulla foto della categoria scelta. */
export const CATEGORY_TO_BACKGROUND_INDEX: Record<string, number> = {
  Cultura: 0,
  Economia: 1,
  Intrattenimento: 2,
  Sport: 3,
  Tecnologia: 4,
  Scienza: 5,
  Politica: 6,
};

/** Ogni foto resta visibile a lungo; crossfade lento per evitare effetti fastidiosi */
const ROTATE_MS_DEFAULT = 12000;
/** Pagina crea evento: rotazione più veloce per far vedere subito la dinamicità */
const ROTATE_MS_CREA_PAGE = 3200;

export interface LandingBackgroundContextValue {
  /** Indice della slide da mostrare (congelato se sulla pagina crea con categoria selezionata). */
  activeIndex: number;
  /** Congela lo sfondo sulla slide corrente (es. quando su /crea l'utente seleziona una categoria). Passa null per riprendere la rotazione. */
  setFrozenIndex: (index: number | null) => void;
}

const LandingBackgroundContext = createContext<LandingBackgroundContextValue>({
  activeIndex: 0,
  setFrozenIndex: () => {},
});

export function useLandingBackground() {
  return useContext(LandingBackgroundContext);
}

interface LandingBackgroundProviderProps {
  children: React.ReactNode;
  /** Intervallo in ms tra un cambio slide e l'altro (default 7800). Solo pagina /crea usa valore più basso. */
  rotationMs?: number;
}

export function LandingBackgroundProvider({ children, rotationMs = ROTATE_MS_DEFAULT }: LandingBackgroundProviderProps) {
  const [runningIndex, setRunningIndex] = useState(0);
  const [frozenIndex, setFrozenIndex] = useState<number | null>(null);
  const activeIndex = frozenIndex !== null ? frozenIndex : runningIndex;

  useEffect(() => {
    const t = setInterval(() => {
      setRunningIndex((i) => (i + 1) % CATEGORY_BACKGROUNDS.length);
    }, rotationMs);
    return () => clearInterval(t);
  }, [rotationMs]);

  return (
    <LandingBackgroundContext.Provider value={{ activeIndex, setFrozenIndex }}>
      {children}
    </LandingBackgroundContext.Provider>
  );
}

/** Usa nel layout: applica rotationMs più veloce solo sulla pagina /crea. */
export function LandingBackgroundProviderWithRoute({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const rotationMs = pathname === "/crea" ? ROTATE_MS_CREA_PAGE : ROTATE_MS_DEFAULT;
  return <LandingBackgroundProvider rotationMs={rotationMs}>{children}</LandingBackgroundProvider>;
}

export default function LandingBackgroundCarousel() {
  const { activeIndex } = useLandingBackground();

  return (
    <div
      className="landing-background-carousel"
      aria-hidden
      role="presentation"
    >
      {CATEGORY_BACKGROUNDS.map((src, i) => (
        <div
          key={src}
          className="landing-background-carousel__slide"
          data-active={i === activeIndex}
          style={{
            backgroundImage: `url(${src})`,
          }}
        />
      ))}
      <div className="landing-background-carousel__overlay" aria-hidden />
    </div>
  );
}
