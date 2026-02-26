"use client";

import { useState, useEffect, useRef, useCallback } from "react";

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

const VISIBLE_MS = 3000;
const FLIP_DURATION_MS = 720;

export default function LandingWhyFlip() {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextIndex = (index + 1) % REASONS.length;

  const doFlip = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped(true);
  }, [isAnimating]);

  useEffect(() => {
    if (isAnimating) return;
    timerRef.current = setTimeout(doFlip, VISIBLE_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [index, isAnimating, doFlip]);

  useEffect(() => {
    if (!isFlipped) return;
    const t = setTimeout(() => {
      setIndex((i) => (i + 1) % REASONS.length);
      setIsFlipped(false);
      setIsAnimating(false);
    }, FLIP_DURATION_MS);
    return () => clearTimeout(t);
  }, [isFlipped]);

  const current = REASONS[index];
  const next = REASONS[nextIndex];

  return (
    <div
      className="landing-why-flip__scene"
      style={{ perspective: "1200px" }}
      aria-live="polite"
      aria-label={`Motivo ${index + 1} di ${REASONS.length}: ${current.title}`}
    >
      <div
        className="landing-why-flip__card-wrapper"
        style={{
          transform: isFlipped
            ? "rotateY(180deg) scale(0.92)"
            : "rotateY(0deg) scale(1)",
          transition: `transform ${FLIP_DURATION_MS}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
        }}
      >
        {/* Front face: current */}
        <div className="landing-why-flip__face landing-why-flip__face--front">
          <div className="landing-why-flip__face-inner">
            <div className="landing-why-flip__icon" aria-hidden>
              {current.icon}
            </div>
            <h3 className="landing-why-flip__title">{current.title}</h3>
            <p className="landing-why-flip__desc">{current.description}</p>
          </div>
        </div>
        {/* Back face: next (visible when rotated 180deg) */}
        <div className="landing-why-flip__face landing-why-flip__face--back">
          <div className="landing-why-flip__face-inner landing-why-flip__face-inner--back">
            <div className="landing-why-flip__icon" aria-hidden>
              {next.icon}
            </div>
            <h3 className="landing-why-flip__title">{next.title}</h3>
            <p className="landing-why-flip__desc">{next.description}</p>
          </div>
        </div>
      </div>
      {/* Dots indicator */}
      <div className="landing-why-flip__dots" role="tablist" aria-label="Motivi per giocare">
        {REASONS.map((_, i) => (
          <span
            key={i}
            className={`landing-why-flip__dot ${i === index ? "landing-why-flip__dot--active" : ""}`}
            role="tab"
            aria-selected={i === index}
            aria-label={`Motivo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
