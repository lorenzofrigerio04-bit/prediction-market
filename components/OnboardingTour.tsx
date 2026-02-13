"use client";

import { useState, useCallback } from "react";

const STEPS = [
  {
    title: "Benvenuto",
    text: "Qui prevedi eventi e guadagni crediti virtuali. In pochi secondi ti mostriamo come.",
    emoji: "👋",
  },
  {
    title: "Eventi e previsioni",
    text: "Scegli un evento, indica SÌ o NO e quanti crediti puntare. Se indovini, vinci crediti.",
    emoji: "🎯",
  },
  {
    title: "Wallet",
    text: "Hai 1000 crediti iniziali. Daily bonus e previsioni corrette li aumentano.",
    emoji: "💰",
  },
  {
    title: "Missioni e badge",
    text: "Completa missioni e sblocca badge per salire in classifica.",
    emoji: "🏆",
  },
  {
    title: "Pronto!",
    text: "Tutto chiaro? Clicca sotto e inizia a prevedere.",
    emoji: "✨",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  }, [isLast, onComplete]);

  const handleSkip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const current = STEPS[step];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleSkip}
        aria-hidden="true"
      />

      {/* Card - stopPropagation evita che il click chiuda per errore tramite il backdrop */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4">
          <div className="text-4xl mb-3" aria-hidden="true">
            {current.emoji}
          </div>
          <h2
            id="onboarding-title"
            className="text-xl font-bold text-gray-900 mb-2"
          >
            {current.title}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {current.text}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 px-6 pb-4">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === step
                  ? "w-6 bg-blue-600"
                  : i < step
                    ? "w-1.5 bg-blue-400"
                    : "w-1.5 bg-gray-200"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Salta
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            {isLast ? "Inizia" : "Avanti"}
          </button>
        </div>
      </div>
    </div>
  );
}
