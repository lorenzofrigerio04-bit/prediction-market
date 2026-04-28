"use client";

/**
 * ArcCarousel
 *
 * Le carte siedono su un arco circolare di grande raggio.
 * La card al centro del viewport è SEMPRE in cima all'arco (y = 0).
 * Le card laterali scendono seguendo y = x² / (2R).
 *
 * Il padding dinamico (padX) garantisce che la prima card parta
 * al centro del container, così l'arco è centrato sui contenuti
 * visibili sin dal primo frame — e rimane tale durante lo scorrimento.
 */

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type ReactNode,
} from "react";

/* ── Parametri arco ──────────────────────────────────── */
const ARC_R       = 900;   // raggio arco (px)
const MAX_DROP    = 88;    // caduta max (px) = extra-altezza container
const SCALE_MIN   = 0.86;
const OPACITY_MIN = 0.55;
/* ────────────────────────────────────────────────────── */

function dropY(dx: number): number {
  return Math.min((dx * dx) / (2 * ARC_R), MAX_DROP);
}

interface ArcCarouselProps<T> {
  items: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
}

export function ArcCarousel<T>({
  items,
  keyExtractor,
  renderItem,
  className = "",
}: ArcCarouselProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const rafId        = useRef<number>(0);
  const hasEntered   = useRef(false);

  const [containerH, setContainerH] = useState(280);
  /** Padding orizzontale che centra la prima/ultima card nel viewport */
  const [padX, setPadX]             = useState(0);

  /* ── Misura le dimensioni reali e aggiorna il layout ── */
  const measureLayout = useCallback(() => {
    const c     = containerRef.current;
    const first = itemRefs.current.find(Boolean);
    if (!c || !first) return;
    setContainerH(first.offsetHeight + MAX_DROP + 6);
    // padding = metà container - metà card → la prima card parte centrata
    setPadX(Math.max(0, Math.round(c.clientWidth / 2 - first.offsetWidth / 2)));
  }, []);

  /* ── Applica le trasformazioni arco ─────────────────── */
  const applyArcs = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const cw    = c.clientWidth;
    const halfW = cw / 2;
    const cx    = c.scrollLeft + cw / 2; // centro visibile corrente

    itemRefs.current.forEach((el) => {
      if (!el) return;
      const dx = el.offsetLeft + el.offsetWidth / 2 - cx;
      const ty = dropY(dx);
      const n  = Math.min(Math.abs(dx) / (halfW * 1.1), 1);
      const sc = 1 - (1 - SCALE_MIN)   * Math.pow(n, 0.80);
      const op = 1 - (1 - OPACITY_MIN) * Math.pow(n, 1.05);

      el.style.transform = `translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(4)})`;
      el.style.opacity   = Math.max(0.12, op).toFixed(3);
    });
  }, []);

  const onScroll = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(applyArcs);
  }, [applyArcs]);

  /* ── Animazione di ingresso a cascata ────────────────── */
  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;

    const enter = () => {
      if (hasEntered.current) return;
      hasEntered.current = true;
      measureLayout();

      // Piccolo delay per dare tempo al layout di riflettersi
      // (padX potrebbe essere appena stato applicato)
      requestAnimationFrame(() => {
        const STAGGER = 38;
        const DUR     = 560;
        const EASE    = "cubic-bezier(0.34,1.12,0.64,1)";

        itemRefs.current.forEach((el, idx) => {
          if (!el) return;
          const dx = el.offsetLeft + el.offsetWidth / 2
                     - (c.scrollLeft + c.clientWidth / 2);
          const ty = dropY(dx);
          const n  = Math.min(Math.abs(dx) / (c.clientWidth * 0.5), 1);
          const sc = 1 - (1 - SCALE_MIN)   * Math.pow(n, 0.80);
          const op = 1 - (1 - OPACITY_MIN) * Math.pow(n, 1.05);

          el.style.transition = "none";
          el.style.opacity    = "0";
          el.style.transform  = `translateY(${(ty + 30).toFixed(1)}px) scale(${(sc - 0.055).toFixed(4)})`;

          setTimeout(() => {
            el.style.transition = `transform ${DUR}ms ${EASE}, opacity ${Math.round(DUR * 0.70)}ms ease`;
            el.style.transform  = `translateY(${ty.toFixed(1)}px) scale(${sc.toFixed(4)})`;
            el.style.opacity    = Math.max(0.12, op).toFixed(3);
          }, 48 + idx * STAGGER);
        });

        const settle = 48 + (itemRefs.current.length - 1) * STAGGER + DUR + 60;
        setTimeout(() => {
          itemRefs.current.forEach((el) => {
            if (!el) return;
            el.style.transition = "transform 0.13s ease-out, opacity 0.13s ease";
          });
        }, settle);
      });
    };

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { enter(); io.disconnect(); } },
      { threshold: 0.07 },
    );
    io.observe(c);
    return () => io.disconnect();
  }, [items, measureLayout]);

  /* ── Resize: ricalcola padding + archi ──────────────── */
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      measureLayout();
      if (hasEntered.current) requestAnimationFrame(applyArcs);
    });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [applyArcs, measureLayout]);

  /* ── Items aggiornati dopo il mount ─────────────────── */
  useEffect(() => {
    if (!hasEntered.current) return;
    requestAnimationFrame(() => {
      measureLayout();
      applyArcs();
    });
  }, [items, applyArcs, measureLayout]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ height: containerH }}
    >
      <div
        ref={containerRef}
        className="h-full scrollbar-hide cursor-grab active:cursor-grabbing overflow-x-auto select-none"
        style={{ scrollSnapType: "x mandatory" }}
        onScroll={onScroll}
      >
        {/*
          padX centra la prima e l'ultima card:
          - prima card parte al centro → dx=0 → in cima all'arco
          - ultima card può arrivare al centro → idem
        */}
        <div
          className="flex items-start gap-2.5 sm:gap-3"
          style={{ paddingLeft: padX, paddingRight: padX }}
        >
          {items.map((item, idx) => (
            <div
              key={keyExtractor(item)}
              ref={(el) => { itemRefs.current[idx] = el; }}
              className="w-[190px] min-w-[190px] sm:w-[240px] sm:min-w-[240px] lg:w-[272px] lg:min-w-[272px]"
              style={{
                scrollSnapAlign: "center",
                willChange: "transform, opacity",
                transformOrigin: "center top",
              }}
            >
              {renderItem(item, idx)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
