"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const MESSAGE_1 = "Inserisci il tuo numero di telefono, ti avviserò appena il tuo evento sarà approvato.";
const MESSAGE_2 = "p.s.: Non perderti il lancio del tuo evento, rimani aggiornato!";

export interface PublishPhoneModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (phone: string) => void;
  isSubmitting?: boolean;
  error?: string;
}

export default function PublishPhoneModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
  error,
}: PublishPhoneModalProps) {
  const [secondMessageVisible, setSecondMessageVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (!open) {
      setSecondMessageVisible(false);
      setPhone("");
      setAcceptTerms(false);
      return;
    }
    const t = setTimeout(() => setSecondMessageVisible(true), 3500);
    return () => clearTimeout(t);
  }, [open]);

  if (!open) return null;

  const canSubmit = phone.trim().length > 0 && acceptTerms && !isSubmitting;

  return (
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/20 backdrop-blur-[1px] crea-category-overlay-fade"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed left-4 right-4 top-1/2 z-[201] -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-2xl border border-white/20 bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] p-5 sm:p-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:max-w-[400px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-phone-title"
      >
        <div className="flex flex-col items-center gap-4">
          <h2 id="publish-phone-title" className="sr-only">
            Inserisci il tuo numero per essere avvisato
          </h2>

          {/* Sfera + messaggi (primo subito, secondo dopo 2s) */}
          <div className="crystal-ball-block flex flex-col items-center gap-4 shrink-0 w-full">
            <div className="crystal-ball-bubbles crystal-ball-bubbles--congrats flex flex-col items-center gap-2 w-full">
              <div
                className="crystal-ball-bubble crystal-ball-bubble--has-tail w-full max-w-[min(280px,90vw)]"
                role="status"
                aria-live="polite"
              >
                <span className="crystal-ball-bubble-text">{MESSAGE_1}</span>
                <span className="crystal-ball-bubble-tail" aria-hidden />
              </div>
              {secondMessageVisible && (
                <div
                  className="crystal-ball-bubble crystal-ball-bubble--complete crystal-ball-bubble--has-tail crystal-ball-bubble--animate-in w-full max-w-[min(280px,90vw)]"
                  role="status"
                  aria-live="polite"
                >
                  <span className="crystal-ball-bubble-text text-sm opacity-90">{MESSAGE_2}</span>
                  <span className="crystal-ball-bubble-tail" aria-hidden />
                </div>
              )}
            </div>
            <div className="crystal-ball" aria-hidden>
              <div className="crystal-ball-inner">
                <div className="crystal-ball-shine" />
                <div className="crystal-ball-glow" />
                <div className="crystal-ball-sparkle crystal-ball-sparkle--1" />
                <div className="crystal-ball-sparkle crystal-ball-sparkle--2" />
                <div className="crystal-ball-sparkle crystal-ball-sparkle--3" />
              </div>
            </div>
          </div>

          {/* Telefono */}
          <div className="w-full">
            <label htmlFor="publish-phone-input" className="block text-sm font-medium text-white/90 mb-1.5">
              Numero di telefono
            </label>
            <input
              id="publish-phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+39 333 1234567"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              autoComplete="tel"
              disabled={isSubmitting}
            />
          </div>

          {/* Checkbox termini */}
          <div className="w-full flex items-start gap-3">
            <input
              id="publish-accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={isSubmitting}
              className="mt-1 h-4 w-4 rounded border-white/30 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0"
            />
            <label htmlFor="publish-accept-terms" className="text-sm text-white/85 leading-tight cursor-pointer">
              Accetto i{" "}
              <Link
                href="/termini-creazione-evento"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary hover:text-primary/90"
              >
                termini e condizioni
              </Link>{" "}
              per la notifica dell&apos;approvazione dell&apos;evento e le comunicazioni di aggiornamento.
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-300 bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-2 w-full">
              {error}
            </p>
          )}

          {/* Azioni */}
          <div className="w-full flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => canSubmit && onConfirm(phone.trim())}
              disabled={!canSubmit}
              className="landing-cta-primary min-h-[48px] px-6 py-3 rounded-xl font-semibold text-ds-body-sm w-full inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Pubblicazione…" : "Pubblica"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors py-2 disabled:opacity-50"
            >
              Annulla
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
