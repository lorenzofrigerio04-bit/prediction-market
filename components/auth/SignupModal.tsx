"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import SignupScreen from "@/components/auth/SignupScreen";

type SignupModalProps = {
  open: boolean;
  onClose: () => void;
  /** Dopo congratulations: naviga verso la pagina dove l'utente aveva aperto il modal. */
  welcomeNavigateEmbedded?: () => void;
  /** Destinazione post-OAuth Google (stessa di /auth/signup standalone). */
  authSuccessCallbackUrl?: string;
};

export default function SignupModal({
  open,
  onClose,
  welcomeNavigateEmbedded,
  authSuccessCallbackUrl = "/",
}: SignupModalProps) {
  const [mounted, setMounted] = useState(false);
  const [embeddedFlowStep, setEmbeddedFlowStep] = useState<"form" | "verify" | "welcome">("form");

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) setEmbeddedFlowStep("form");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.setAttribute("data-auth-intercept-modal", "");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.removeAttribute("data-auth-intercept-modal");
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted || typeof document === "undefined") return null;
  if (!open) return null;

  return createPortal(
    <div
      className="auth-intercept-modal-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-modal-heading"
    >
      <div
        role="presentation"
        className={`signup-modal-scrim signup-modal-scrim-enter absolute inset-0 z-0${
          embeddedFlowStep === "welcome" ? " credits-welcome-scrim" : ""
        }`}
        onClick={onClose}
      />

      <div className="relative z-[1] w-full max-w-[min(calc(100vw-2rem),356px)] signup-modal-panel-enter sm:max-w-[376px]">
        <span id="signup-modal-heading" className="sr-only">
          Creazione account
        </span>

        <div className="relative min-w-0 auth-intercept-modal-panel-max-h flex min-h-0 flex-col">
          <div className="signup-modal-tiffany-glow" aria-hidden />
          <div className="signup-modal-glass-shell signup-modal-glass signup-modal-glass--premium-pulse relative flex min-h-0 flex-col overflow-hidden rounded-[22px] max-h-[inherit] sm:rounded-[26px]">
            <div className="signup-modal-glass-specular pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden" aria-hidden />

            <button
              type="button"
              onClick={onClose}
              className="signup-modal-close-x absolute right-3 top-3 z-[10]"
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

            <div className="signup-modal-scroll relative z-[1] flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain px-5 pb-5 pt-[2.25rem] sm:px-[1.35rem]">
              <SignupScreen
                embedded
                authSuccessCallbackUrl={authSuccessCallbackUrl}
                onDismissRequest={onClose}
                welcomeNavigateEmbedded={welcomeNavigateEmbedded}
                onEmbeddedFlowStepChange={setEmbeddedFlowStep}
              />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes signup-modal-scrim-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes signup-modal-panel-in {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .signup-modal-scrim-enter {
          animation: signup-modal-scrim-in 0.12s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }
        .signup-modal-panel-enter {
          animation: signup-modal-panel-in 0.16s cubic-bezier(0.33, 1, 0.32, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .signup-modal-scrim-enter,
          .signup-modal-panel-enter {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
        .signup-modal-scrim {
          cursor: default;
          background: rgba(4, 8, 18, 0.12);
          -webkit-backdrop-filter: blur(11px) saturate(150%) brightness(0.96);
          backdrop-filter: blur(11px) saturate(150%) brightness(0.96);
        }
        .signup-modal-glass-shell {
          transform: translateZ(0);
          isolation: isolate;
        }
        .signup-modal-glass {
          position: relative;
          background: rgba(12, 16, 28, 0.38);
          -webkit-backdrop-filter: blur(56px) saturate(195%) brightness(1.04);
          backdrop-filter: blur(56px) saturate(195%) brightness(1.04);
          border: 0.5px solid rgba(56, 220, 210, 0.18);
          box-shadow:
            0 0 0 0.5px rgba(255, 255, 255, 0.05),
            0 1px 0 rgba(255, 255, 255, 0.07) inset,
            0 -1px 0 rgba(0, 0, 0, 0.12) inset,
            0 48px 100px -40px rgba(0, 0, 0, 0.7);
        }
        .signup-modal-glass-specular::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0.46;
          background:
            linear-gradient(153deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.03) 35%, transparent 52%),
            linear-gradient(-32deg, transparent 54%, rgba(120, 255, 246, 0.05) 100%);
          pointer-events: none;
          mix-blend-mode: overlay;
        }
        .signup-modal-glass-specular::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          opacity: 0.5;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.12);
          pointer-events: none;
        }
        @supports (-webkit-touch-callout: none) {
          .signup-modal-glass {
            -webkit-backdrop-filter: blur(42px) saturate(200%);
          }
          .signup-modal-scrim {
            -webkit-backdrop-filter: blur(9px) saturate(150%);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
