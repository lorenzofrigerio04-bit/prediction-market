"use client";

import { useEffect, useCallback } from "react";

// —— Choice: incassa o ruota moltiplicatrice ——
interface SpinChoiceModalProps {
  isOpen: boolean;
  credits: number;
  onCash: () => void;
  onMultiplier: () => void;
  loading?: boolean;
}

export function SpinChoiceModal({
  isOpen,
  credits,
  onCash,
  onMultiplier,
  loading = false,
}: SpinChoiceModalProps) {
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") return;
    },
    []
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="spin-modal-overlay spin-modal-overlay--enter"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spin-choice-title"
    >
      <div className="spin-modal spin-modal--enter" onClick={(e) => e.stopPropagation()}>
        <h2 id="spin-choice-title" className="spin-modal__title">
          Hai vinto {credits} crediti
        </h2>
        <p className="spin-modal__text">
          Vuoi incassarli o giocare la ruota moltiplicatrice?
        </p>
        <div className="spin-modal__actions">
          <button
            type="button"
            onClick={onCash}
            disabled={loading}
            className="spin-modal__btn spin-modal__btn--primary"
          >
            {loading ? "..." : "Incassa"}
          </button>
          <button
            type="button"
            onClick={onMultiplier}
            disabled={loading}
            className="spin-modal__btn spin-modal__btn--secondary"
          >
            Ruota moltiplicatrice
          </button>
        </div>
      </div>
    </div>
  );
}

// —— Congrats: dopo incassa ——
interface SpinCongratsModalProps {
  isOpen: boolean;
  credits: number;
  onClose: () => void;
}

export function SpinCongratsModal({
  isOpen,
  credits,
  onClose,
}: SpinCongratsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="spin-modal-overlay spin-modal-overlay--enter"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spin-congrats-title"
      onClick={onClose}
    >
      <div className="spin-modal spin-modal--enter" onClick={(e) => e.stopPropagation()}>
        <h2 id="spin-congrats-title" className="spin-modal__title spin-modal__title--large">
          Congratulazioni
        </h2>
        <p className="spin-modal__text spin-modal__text--highlight">
          Oggi hai vinto <strong>{credits} crediti</strong>.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="spin-modal__btn spin-modal__btn--primary"
        >
          OK
        </button>
      </div>
    </div>
  );
}

// —— Multiplier result: WOW, X × Y crediti ——
interface SpinMultiplierResultModalProps {
  isOpen: boolean;
  baseCredits: number;
  multiplier: number;
  totalCredits: number;
  onClose: () => void;
}

export function SpinMultiplierResultModal({
  isOpen,
  baseCredits,
  multiplier,
  totalCredits,
  onClose,
}: SpinMultiplierResultModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="spin-modal-overlay spin-modal-overlay--enter"
      role="dialog"
      aria-modal="true"
      aria-labelledby="spin-mult-result-title"
      onClick={onClose}
    >
      <div className="spin-modal spin-modal--enter spin-modal--multiplier" onClick={(e) => e.stopPropagation()}>
        <h2 id="spin-mult-result-title" className="spin-modal__title spin-modal__title--large">
          WOW
        </h2>
        <p className="spin-modal__text spin-modal__text--highlight">
          Hai vinto <strong>{baseCredits} × {multiplier} = {totalCredits} crediti</strong>.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="spin-modal__btn spin-modal__btn--primary"
        >
          OK
        </button>
      </div>
    </div>
  );
}
