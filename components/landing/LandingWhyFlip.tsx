"use client";

import { useState, useEffect } from "react";

const REASONS = [
  {
    icon: "🏆",
    title: "Classifiche settimanali",
    description: "Sali in classifica ogni settimana e confrontati con la community.",
  },
  {
    icon: "🎯",
    title: "Missioni & streak",
    description: "Completa missioni e mantieni lo streak per crediti extra.",
  },
  {
    icon: "📋",
    title: "Regole trasparenti",
    description: "Ogni evento ha criteri di risoluzione chiari e verificabili.",
  },
  {
    icon: "🛡️",
    title: "Zero rischi",
    description: "Gioca con crediti virtuali: divertimento senza rischi economici.",
  },
] as const;

const SWAP_INTERVAL_MS = 2600;

export default function LandingWhyFlip() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % REASONS.length);
    }, SWAP_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <div
      className="landing-why-flip__scene"
      aria-live="polite"
      aria-label={`Motivo ${index + 1} di ${REASONS.length}: ${REASONS[index].title}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="landing-why-flip__stack">
        {REASONS.map((reason, i) => {
          const relativePos = (i - index + REASONS.length) % REASONS.length;
          return (
            <article
              key={reason.title}
              className={`landing-why-flip__card landing-why-flip__card--pos-${Math.min(relativePos, 3)}`}
              aria-hidden={relativePos !== 0}
            >
              <div className="landing-why-flip__face-inner">
                <div className="landing-why-flip__icon" aria-hidden>
                  {reason.icon}
                </div>
                <h3 className="landing-why-flip__title">{reason.title}</h3>
                <p className="landing-why-flip__desc">{reason.description}</p>
              </div>
            </article>
          );
        })}
      </div>
      <span className="sr-only">
        Card in evidenza: {REASONS[index].title}.{" "}
        {paused ? "Animazione in pausa." : "Animazione attiva."}
      </span>
    </div>
  );
}
