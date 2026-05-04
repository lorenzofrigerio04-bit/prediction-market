"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

const eur = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
const creditsFmt = new Intl.NumberFormat("it-IT");

type ShopPaymentModalTarget = {
  name: string;
  priceEur: number;
  credits: number;
};

type ShopPaymentModalProps = {
  target: ShopPaymentModalTarget | null;
  onClose: () => void;
};

export default function ShopPaymentModal({ target, onClose }: ShopPaymentModalProps) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!target) return;
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
  }, [target, onClose]);

  if (!mounted || typeof document === "undefined" || !target) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[280] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-payment-modal-title"
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

        <div className="relative px-6 pb-6 pt-10 text-center sm:px-8 sm:pb-8 sm:pt-11">
          <p className="text-ds-label font-semibold uppercase tracking-[0.12em] text-[#7DD3D0]/90">
            Pagamento
          </p>
          <h2
            id="shop-payment-modal-title"
            className="mt-3 font-kalshi text-2xl font-bold tracking-[0.02em] text-white sm:text-[1.65rem]"
          >
            {target.name}
          </h2>
          <p className="mt-2 text-ds-body-sm text-white/55">
            {creditsFmt.format(target.credits)} crediti · {eur.format(target.priceEur)}
          </p>
          <p className="mt-5 text-ds-body-sm leading-relaxed text-white/45">
            Il checkout non è ancora collegato: qui aprirai il flusso di pagamento non appena sarà
            attivo.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="signup-cta-premium-outline relative z-[2] mt-6 w-full max-w-none"
          >
            <span className="relative z-[2]">Chiudi</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
