"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import SignupWelcomeCreditsReveal from "@/components/auth/SignupWelcomeCreditsReveal";
import { INITIAL_CREDITS } from "@/lib/credits-config";

type CreditsWelcomeModalProps = {
  open: boolean;
  onClose: () => void;
  /** Stesso flusso SignupModal: dopo animazione crediti (router refresh / chiusura). */
  welcomeNavigateEmbedded?: () => void;
  /** Destinazione post-reveal (come SignupScreen embedded). Default "/". */
  authSuccessCallbackUrl?: string;
};

function clientOnlySubscribe(): () => void {
  return () => {};
}

/**
 * Stesso guscio vetro + timings di `SignupModal` e stesso blocco congratulations/counter
 * del flusso nome/cognome/email/password (`SignupScreen` step `welcome`, embedded).
 */
export default function CreditsWelcomeModal({
  open,
  onClose,
  welcomeNavigateEmbedded,
  authSuccessCallbackUrl = "/",
}: CreditsWelcomeModalProps) {
  const mounted = useSyncExternalStore(clientOnlySubscribe, () => true, () => false);

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
      aria-labelledby="credits-welcome-modal-heading"
    >
      <div
        role="presentation"
        className="signup-modal-scrim signup-modal-scrim-enter credits-welcome-scrim absolute inset-0 z-0"
        onClick={onClose}
      />

      <div className="relative z-[1] w-full max-w-[min(calc(100vw-2rem),356px)] signup-modal-panel-enter sm:max-w-[376px]">
        <span id="credits-welcome-modal-heading" className="sr-only">
          Congratulazioni, benvenuto
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
              <div className="relative mb-2 py-2 text-center">
                <h1
                  className="signup-welcome-title text-white leading-tight tracking-tight"
                  style={{ fontSize: "clamp(1.35rem, 5.5vw, 1.75rem)" }}
                >
                  Congratulazioni!
                </h1>
                <SignupWelcomeCreditsReveal
                  embedded
                  target={INITIAL_CREDITS}
                  welcomeNavigateEmbedded={welcomeNavigateEmbedded}
                  authSuccessCallbackUrl={authSuccessCallbackUrl}
                />
                <p
                  className="mt-2 text-[13px] leading-relaxed px-1"
                  style={{ color: "rgba(169,180,208,0.85)" }}
                >
                  Benvenuto ufficialmente su{" "}
                  <span className="pm-logo-header__text signup-welcome-inline-brand inline-flex items-baseline align-baseline whitespace-nowrap">
                    <span className="pm-logo-header__prediction">Prediction</span>
                    <span className="pm-logo-header__master">Master</span>
                  </span>
                  .
                </p>
              </div>
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
        }
      `}</style>
    </div>,
    document.body
  );
}
