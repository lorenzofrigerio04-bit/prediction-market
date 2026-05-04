"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function MasterCoinInfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[280] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-mystery-master-coin-info-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Chiudi"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-[min(calc(100vw-2rem),400px)] overflow-hidden rounded-[22px] border border-[rgba(33,185,180,0.4)] bg-gradient-to-b from-[rgba(8,28,34,0.97)] to-[rgba(4,14,18,0.99)] shadow-[0_0_48px_-12px_rgba(10,186,181,0.35)] sm:rounded-[26px]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(80,245,252,0.35), transparent 55%)",
          }}
          aria-hidden
        />

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white/90"
          aria-label="Chiudi"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="relative px-6 pb-6 pt-10 text-left sm:px-8 sm:pb-8 sm:pt-11">
          <h2
            id="shop-mystery-master-coin-info-title"
            className="font-kalshi text-xl font-bold tracking-[0.02em] text-white sm:text-[1.45rem]"
          >
            Master coin e mystery box
          </h2>
          <p className="mt-4 text-ds-body-sm leading-relaxed text-white/70">
            Le mystery box si acquistano con i <span className="font-semibold text-white/88">Master coin</span>:
            punti fedeltà che guadagni compiendo azioni sulla piattaforma (come previsioni, missioni e altre
            attività).{" "}
            <span className="font-semibold text-white/88">Non sono acquistabili con denaro reale</span>.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function ShopMysterySectionHeader() {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <>
      <header className="flex justify-center pt-0">
        <div className="relative inline-block">
          <h1 className="m-0 pr-[calc(17px+0.375rem)] font-kalshi text-[1.95rem] font-bold leading-[1.05] tracking-[-0.022em] text-white sm:pr-[calc(18px+0.5rem)] sm:text-[2.35rem] md:text-[2.75rem]">
            Mystery box
          </h1>
          <button
            type="button"
            onClick={() => setInfoOpen(true)}
            className="absolute right-0 top-0 bottom-0 my-auto flex h-[17px] w-[17px] translate-y-[2px] items-center justify-center rounded-full border border-[rgba(125,211,208,0.5)] bg-white/[0.04] text-[9px] font-bold leading-none text-[#7DD3D0] transition-colors hover:border-[rgba(125,211,208,0.85)] hover:bg-white/[0.08] hover:text-[#9AE8E4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/50 sm:h-[18px] sm:w-[18px] sm:text-[10px]"
            aria-label="Informazioni sui Master coin"
            aria-expanded={infoOpen}
            aria-haspopup="dialog"
          >
            i
          </button>
        </div>
      </header>
      <MasterCoinInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </>
  );
}
