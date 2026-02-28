"use client";

import { useEffect, useState } from "react";

const STEP_MESSAGES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "STEP 1: Scegli la categoria",
  2: "STEP 2: Scrivi il titolo",
  3: "STEP 3: Scrivi la descrizione dell'evento",
  4: "STEP 4: Inserisci la scadenza",
  5: "STEP 5: Inserisci il link per risoluzione dell'evento",
};

export interface CrystalBallStepProps {
  /** Step 1 completato = categoria selezionata */
  step1Done: boolean;
  /** Step 2 completato = titolo confermato (blur/Invio) */
  step2Done: boolean;
  /** Step 3 completato = descrizione compilata */
  step3Done: boolean;
  /** Step 4 completato = scadenza inserita */
  step4Done: boolean;
  /** Step 5 completato = link risoluzione inserito */
  step5Done: boolean;
  /** Quando true, i messaggi si ritirano (animazione prima dello slide) */
  retract?: boolean;
}

export default function CrystalBallStep({ step1Done, step2Done, step3Done, step4Done, step5Done, retract = false }: CrystalBallStepProps) {
  const [isShaking, setIsShaking] = useState(true);
  /** Step "corrente" per la scossa: 1 → 2 → 3 → 4 → 5 quando si sbloccano i messaggi */
  const currentStep: 1 | 2 | 3 | 4 | 5 = !step1Done ? 1 : !step2Done ? 2 : !step3Done ? 3 : !step4Done ? 4 : 5;
  const allComplete = step1Done && step2Done && step3Done && step4Done && step5Done;

  useEffect(() => {
    queueMicrotask(() => setIsShaking(true));
    const t = setTimeout(() => setIsShaking(false), 1180);
    return () => clearTimeout(t);
  }, [currentStep]);

  const bubbles: { step: 1 | 2 | 3 | 4 | 5; label: string }[] = [
    { step: 1, label: STEP_MESSAGES[1] },
    ...(step1Done ? [{ step: 2 as const, label: STEP_MESSAGES[2] }] : []),
    ...(step2Done ? [{ step: 3 as const, label: STEP_MESSAGES[3] }] : []),
    ...(step3Done ? [{ step: 4 as const, label: STEP_MESSAGES[4] }] : []),
    ...(step4Done ? [{ step: 5 as const, label: STEP_MESSAGES[5] }] : []),
  ];

  return (
    <div className="crystal-ball-block flex flex-col items-center gap-4 shrink-0">
      {/* Messaggini: si accumulano (1, poi 1+2, poi 1+2+3); con retract si ritirano */}
      <div className={`crystal-ball-bubbles flex flex-col items-center gap-2 transition-all duration-500 ease-out ${retract ? "crystal-ball-bubbles--retract" : ""}`}>
        {bubbles.map(({ step, label }, i) => (
          <div
            key={step}
            className={`crystal-ball-bubble ${allComplete ? "crystal-ball-bubble--complete" : ""} ${i === bubbles.length - 1 ? "crystal-ball-bubble--has-tail" : ""}`}
            role="status"
            aria-live="polite"
            aria-label={label}
          >
            <span className="crystal-ball-bubble-text">{label}</span>
            {i === bubbles.length - 1 && <span className="crystal-ball-bubble-tail" aria-hidden />}
          </div>
        ))}
      </div>

      {/* Sfera di cristallo */}
      <div
        className={`crystal-ball ${isShaking ? "crystal-ball--shake" : ""}`}
        aria-hidden
      >
        <div className="crystal-ball-inner">
          <div className="crystal-ball-shine" />
          <div className="crystal-ball-glow" />
          <div className="crystal-ball-sparkle crystal-ball-sparkle--1" />
          <div className="crystal-ball-sparkle crystal-ball-sparkle--2" />
          <div className="crystal-ball-sparkle crystal-ball-sparkle--3" />
        </div>
      </div>
    </div>
  );
}
